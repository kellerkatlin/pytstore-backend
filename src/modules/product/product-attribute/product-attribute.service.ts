import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateProductAttributeDto } from './dto/create-product-attribute.dto';
import { created, ok } from 'src/common/helpers/response.helper';

@Injectable()
export class ProductAttributeService {
  constructor(private readonly prisma: PrismaService) {}

  async assign(dto: CreateProductAttributeDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product || product.status === 'DELETED') {
      throw new NotFoundException('Producto no encontrado');
    }

    const attribute = await this.prisma.attribute.findUnique({
      where: { id: dto.attributeId },
    });
    if (!attribute || attribute.categoryId !== product.categoryId) {
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

    const exists = await this.prisma.productAttribute.findFirst({
      where: {
        productId: dto.productId,
        attributeId: dto.attributeId,
      },
    });
    if (exists) {
      throw new ConflictException(
        'Ya se ha asignado este atributo al producto',
      );
    }

    const result = await this.prisma.productAttribute.create({
      data: dto,
      include: {
        attribute: true,
        value: true,
      },
    });

    return created(result, 'Atributo asignado correctamente');
  }

  async findByProduct(productId: number) {
    const attributes = await this.prisma.productAttribute.findMany({
      where: { productId },
      include: {
        attribute: true,
        value: true,
      },
    });

    return ok(attributes, 'Atributos del producto');
  }

  async remove(id: number) {
    await this.prisma.productAttribute.delete({ where: { id } });
    return ok(null, 'Atributo eliminado');
  }
}
