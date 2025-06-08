import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateVariantAttributeDto } from './dto/create-variant-attribute.dto';
import { created, ok } from 'src/common/helpers/response.helper';

@Injectable()
export class VariantAttributeService {
  constructor(private readonly prisma: PrismaService) {}

  async assign(dto: CreateVariantAttributeDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      include: { product: true },
    });
    if (!variant) throw new NotFoundException('Variante no encontrada');

    const attribute = await this.prisma.attribute.findUnique({
      where: { id: dto.attributeId },
    });
    if (!attribute || attribute.categoryId !== variant.product.categoryId) {
      throw new ConflictException(
        'Atributo no válido para la categoría del producto',
      );
    }

    const value = await this.prisma.attributeValue.findUnique({
      where: { id: dto.valueId },
    });
    if (!value || value.attributeId !== dto.attributeId) {
      throw new ConflictException('Valor no corresponde al atributo');
    }

    const exists = await this.prisma.variantAttribute.findFirst({
      where: {
        variantId: dto.variantId,
        attributeId: dto.attributeId,
      },
    });
    if (exists)
      throw new ConflictException('Atributo ya asignado a esta variante');

    const data = await this.prisma.variantAttribute.create({
      data: dto,
      include: { attribute: true, value: true },
    });

    return created(data, 'Atributo asignado a variante');
  }

  async findByVariant(variantId: number) {
    const attributes = await this.prisma.variantAttribute.findMany({
      where: { variantId },
      include: { attribute: true, value: true },
    });

    return ok(attributes, 'Atributos de la variante');
  }

  async remove(id: number) {
    await this.prisma.variantAttribute.delete({ where: { id } });
    return ok(null, 'Atributo de variante eliminado');
  }
}
