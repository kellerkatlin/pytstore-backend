import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { created, ok } from 'src/common/helpers/response.helper';

@Injectable()
export class AttributeValueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttributeValueDto) {
    const attr = await this.prisma.attribute.findUnique({
      where: { id: dto.attributeId },
    });
    if (!attr) throw new NotFoundException('Atributo no encontrado');

    const value = await this.prisma.attributeValue.create({ data: dto });
    return created(value, 'Valor creado');
  }

  async findByAttribute(attributeId: number) {
    const values = await this.prisma.attributeValue.findMany({
      where: { attributeId },
    });
    return ok(values, 'Valores por atributo');
  }

  async remove(id: number) {
    await this.prisma.attributeValue.delete({ where: { id } });
    return ok(null, 'Valor eliminado');
  }
}
