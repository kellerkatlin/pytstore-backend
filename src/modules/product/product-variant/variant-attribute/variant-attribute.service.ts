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
    // 1. Buscar la variante con su producto
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      include: { product: true },
    });
    if (!variant) throw new NotFoundException('Variante no encontrada');

    // 2. Verificar que el atributo existe
    const attribute = await this.prisma.attribute.findUnique({
      where: { id: dto.attributeId },
    });
    if (!attribute) throw new NotFoundException('Atributo no encontrado');

    // 3. Validar que el atributo pertenece a un producto

    const productAttribute = await this.prisma.productAttribute.findFirst({
      where: {
        productId: variant.productId,
        attributeId: dto.attributeId,
      },
      include: {
        values: true,
      },
    });

    if (!productAttribute) {
      throw new ConflictException(
        'Este atributo no está definido para el producto base',
      );
    }

    const isValidValue = productAttribute.values.some(
      (v) => v.valueId === dto.valueId,
    );
    if (!isValidValue) {
      throw new ConflictException(
        'El valor indicado no está permitido para este atributo del producto',
      );
    }

    // 5. Verificar si ya está asignado
    const exists = await this.prisma.variantAttribute.findFirst({
      where: {
        variantId: dto.variantId,
        attributeId: dto.attributeId,
      },
    });
    if (exists)
      throw new ConflictException('Atributo ya asignado a esta variante');

    // 6. Crear el registro
    const data = await this.prisma.variantAttribute.create({
      data: dto,
      include: {
        attribute: true,
        value: true,
      },
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
