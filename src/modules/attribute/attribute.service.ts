import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { created, ok } from 'src/common/helpers/response.helper';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

@Injectable()
export class AttributeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttributeDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category || category.isDeleted) {
      throw new NotFoundException('Categoría no válida');
    }

    const attribute = await this.prisma.attribute.create({
      data: {
        name: dto.name,
        categoryId: dto.categoryId,
      },
    });

    return created(attribute, 'Atributo creado correctamente');
  }

  async findAll() {
    const attributes = await this.prisma.attribute.findMany({
      include: { category: { select: { id: true, name: true } } },
    });
    return ok(attributes, 'Lista de atributos');
  }

  async findByCategory(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category || category.isDeleted) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const attributes = await this.prisma.attribute.findMany({
      where: { categoryId },
      include: { values: true },
    });

    return ok(attributes, 'Atributos por categoría');
  }

  async update(id: number, dto: UpdateAttributeDto) {
    const exists = await this.prisma.attribute.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Atributo no encontrado');

    const updated = await this.prisma.attribute.update({
      where: { id },
      data: dto,
    });

    return ok(updated, 'Atributo actualizado');
  }

  async remove(id: number) {
    await this.prisma.attribute.delete({ where: { id } });
    return ok(null, 'Atributo eliminado');
  }
}
