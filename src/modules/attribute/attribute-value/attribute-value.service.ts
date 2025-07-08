import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { created, ok, paginated } from 'src/common/helpers/response.helper';
import { Prisma } from '@prisma/client';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { FilterAttributeValueDto } from './dto/filter-attribute-value.dto';

@Injectable()
export class AttributeValueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(attributeId: number, dto: CreateAttributeValueDto) {
    await this.prisma.attribute.findUniqueOrThrow({
      where: { id: attributeId, status: 'ACTIVE' },
    });

    const duplicate = await this.prisma.attributeValue.findFirst({
      where: { attributeId, value: dto.value },
    });

    if (duplicate) throw new ConflictException('Valor duplicado');

    const value = await this.prisma.attributeValue.create({
      data: { attributeId, value: dto.value },
    });

    return created(value, 'Valor creado');
  }

  async findByAttribute(attributeId: number, query: FilterAttributeValueDto) {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      order = 'desc',
    } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.AttributeValueWhereInput = {
      attributeId,
      value: { contains: search, mode: 'insensitive' },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.attributeValue.findMany({
        where,
        skip,
        take: +limit,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.attributeValue.count({ where }),
    ]);

    return paginated(
      items,
      {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
      'Valores de atributos listados',
    );
  }
  async findById(id: number) {
    const value = await this.prisma.attributeValue.findUnique({
      where: { id },
      include: {
        attribute: {
          select: { id: true, name: true },
        },
      },
    });

    if (!value) {
      throw new NotFoundException('Valor de atributo no encontrado');
    }

    return ok(value, 'Valor de atributo obtenido');
  }

  async update(id: number, dto: UpdateAttributeValueDto) {
    const updated = await this.prisma.attributeValue.update({
      where: { id },
      data: { value: dto.value },
    });

    return ok(updated, 'Valor actualizado');
  }

  async remove(id: number) {
    const used = await this.prisma.$transaction([
      this.prisma.productAttributeValue.count({ where: { valueId: id } }),
      this.prisma.productItemAttribute.count({ where: { valueId: id } }),
      this.prisma.variantAttribute.count({ where: { valueId: id } }),
    ]);

    if (used.some((count) => count > 0)) {
      throw new ConflictException('No se puede eliminar: valor en uso');
    }
    await this.prisma.attributeValue.delete({ where: { id } });
    return ok(null, 'Valor eliminado ');
  }
}
