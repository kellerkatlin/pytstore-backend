import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { created, ok, paginated } from 'src/common/helpers/response.helper';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { Prisma } from '@prisma/client';

const ALLOWED_SORT: Record<string, true> = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
};
@Injectable()
export class AttributeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttributeDto) {
    // Convertir el nombre a minúsculas para validar sin importar mayúsculas/minúsculas
    const exists = await this.prisma.attribute.findFirst({
      where: {
        name: {
          equals: dto.name.toLowerCase(),
          mode: 'insensitive',
        },
      },
    });
    if (exists) {
      throw new ConflictException('Ya existe un atributo con ese nombre');
    }

    const attribute = await this.prisma.attribute.create({
      data: {
        ...dto,
      },
    });

    return created(attribute, 'Atributo creado correctamente');
  }

  async findAll(
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'id',
    order: 'asc' | 'desc' = 'desc',
  ) {
    if (!ALLOWED_SORT[sortBy]) sortBy = 'id';

    const skip = (page - 1) * limit;

    const where: Prisma.AttributeWhereInput = {
      name: {
        contains: search,
        mode: 'insensitive',
      },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.attribute.findMany({
        skip,
        take: limit,
        where,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.attribute.count({ where }),
    ]);

    return paginated(
      items,
      { total, page, lastPage: Math.ceil(total / limit) },
      'Listado de atributos obtenido correctamente',
    );
  }

  async findById(id: number) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id },
    });

    if (!attribute) {
      throw new NotFoundException('Atributo no encontrado');
    }

    return ok(attribute, 'Atributo obtenido correctamente');
  }

  async update(id: number, dto: UpdateAttributeDto) {
    const exists = await this.prisma.attribute.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Atributo no encontrado');

    const updated = await this.prisma.attribute.update({
      where: { id },
      data: {
        ...dto,
      },
    });

    return ok(updated, 'Atributo actualizado');
  }

  async remove(id: number) {
    await this.prisma.attribute.delete({ where: { id } });
    return ok(null, 'Atributo eliminado');
  }
}
