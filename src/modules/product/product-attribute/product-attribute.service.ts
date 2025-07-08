import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ok, paginated } from 'src/common/helpers/response.helper';

@Injectable()
export class ProductAttributeService {
  constructor(private readonly prisma: PrismaService) {}

  async getAssignedAttributes(
    productId: number,
    query: { page?: number; limit?: number; search?: string },
  ) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;
    const search = query.search ?? '';

    const [rawItems, total] = await this.prisma.$transaction([
      this.prisma.productAttribute.findMany({
        where: {
          productId,
          attribute: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        include: {
          attribute: true,
        },
        orderBy: { attribute: { name: 'asc' } },
        skip,
        take: limit,
      }),
      this.prisma.productAttribute.count({
        where: {
          productId,
          attribute: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      }),
    ]);

    const items = rawItems.map((item) => ({
      id: item.id,
      attributeId: item.attribute.id,
      name: item.attribute.name,
    }));

    return paginated(
      items,
      {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
      'Atributos asignados al producto',
    );
  }

  async getAssignedAttributeValues(
    productId: number,
    attributeId: number,
    query: { page?: number; limit?: number; search?: string },
  ) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;
    const search = query.search ?? '';

    const prodAttr = await this.prisma.productAttribute.findFirst({
      where: { productId, attributeId },
    });

    if (!prodAttr) {
      throw new NotFoundException('Atributo no asignado al producto');
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.productAttributeValue.findMany({
        where: {
          productAttributeId: prodAttr.id,
          value: {
            value: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        include: { value: true },
        orderBy: { value: { value: 'asc' } },
        skip,
        take: limit,
      }),
      this.prisma.productAttributeValue.count({
        where: {
          productAttributeId: prodAttr.id,
          value: {
            value: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      }),
    ]);

    return paginated(
      items,
      {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
      'Valores asignados al atributo',
    );
  }

  async getUnassignedAttributes(
    productId: number,
    query: { search?: string; page?: number; limit?: number },
  ) {
    const { page = 1, limit = 10, search = '' } = query;
    const skip = (page - 1) * limit;

    const assignedAttributes = await this.prisma.productAttribute.findMany({
      where: { productId },
      select: { attributeId: true },
    });

    const assignedIds = assignedAttributes.map((a) => a.attributeId);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.attribute.findMany({
        where: {
          id: { notIn: assignedIds },
          name: { contains: search, mode: 'insensitive' },
        },
        skip,
        take: +limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.attribute.count({
        where: {
          id: { notIn: assignedIds },
          name: { contains: search, mode: 'insensitive' },
        },
      }),
    ]);

    return paginated(
      items,
      {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
      'Atributos no asignados al producto',
    );
  }

  async getUnassignedValues(
    productId: number,
    attributeId: number,
    query: { search?: string; page?: number; limit?: number },
  ) {
    const { page = 1, limit = 10, search = '' } = query;
    const skip = (page - 1) * limit;

    // Obtener ProductAttribute.id
    const productAttribute = await this.prisma.productAttribute.findFirst({
      where: { productId, attributeId },
    });

    if (!productAttribute) {
      throw new NotFoundException('Atributo no asignado al producto');
    }

    // Obtener los valueIds ya asignados
    const assigned = await this.prisma.productAttributeValue.findMany({
      where: { productAttributeId: productAttribute.id },
      select: { valueId: true },
    });

    const assignedIds = assigned.map((v) => v.valueId);

    // Buscar valores no asignados
    const [items, total] = await this.prisma.$transaction([
      this.prisma.attributeValue.findMany({
        where: {
          attributeId,
          id: { notIn: assignedIds },
          value: { contains: search, mode: 'insensitive' },
        },
        skip,
        take: +limit,
        orderBy: { value: 'asc' },
      }),
      this.prisma.attributeValue.count({
        where: {
          attributeId,
          id: { notIn: assignedIds },
          value: { contains: search, mode: 'insensitive' },
        },
      }),
    ]);

    return paginated(
      items,
      {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
      'Valores no asignados al atributo',
    );
  }

  async assignAttribute(productId: number, attributeId: number) {
    const exists = await this.prisma.productAttribute.findFirst({
      where: { productId, attributeId },
    });

    if (exists) {
      throw new ConflictException('Atributo ya asignado al producto');
    }

    await this.prisma.attribute.findUniqueOrThrow({
      where: { id: attributeId },
    });

    await this.prisma.productAttribute.create({
      data: { productId, attributeId },
    });

    return ok(null, 'Atributo asignado al producto');
  }

  async assignValue(productId: number, attributeId: number, valueId: number) {
    const prodAttr = await this.prisma.productAttribute.findFirst({
      where: { productId, attributeId },
    });

    if (!prodAttr) {
      throw new NotFoundException('Este atributo no está asignado al producto');
    }

    // Validar que el valor realmente corresponde a ese atributo
    const value = await this.prisma.attributeValue.findUnique({
      where: { id: valueId },
    });

    if (!value || value.attributeId !== attributeId) {
      throw new ConflictException('El valor no corresponde al atributo');
    }

    // Verificar si ya está asignado
    const exists = await this.prisma.productAttributeValue.findFirst({
      where: {
        productAttributeId: prodAttr.id,
        valueId,
      },
    });

    if (exists) {
      throw new ConflictException('Valor ya asignado al atributo');
    }

    await this.prisma.productAttributeValue.create({
      data: {
        productAttributeId: prodAttr.id,
        valueId,
      },
    });

    return ok(null, 'Valor asignado al atributo');
  }

  async unassignAttribute(productId: number, attributeId: number) {
    const prodAttr = await this.prisma.productAttribute.findFirst({
      where: { productId, attributeId },
    });

    if (!prodAttr) {
      throw new NotFoundException('Atributo no encontrado para el producto');
    }

    await this.prisma.productAttributeValue.deleteMany({
      where: { productAttributeId: prodAttr.id },
    });

    await this.prisma.productAttribute.delete({
      where: { id: prodAttr.id },
    });

    return ok(null, 'Atributo eliminado del producto');
  }

  async unassignValue(productId: number, attributeId: number, valueId: number) {
    const prodAttr = await this.prisma.productAttribute.findFirst({
      where: { productId, attributeId },
    });

    if (!prodAttr) {
      throw new NotFoundException('Este atributo no está asignado al producto');
    }

    const deleted = await this.prisma.productAttributeValue.deleteMany({
      where: {
        productAttributeId: prodAttr.id,
        valueId,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundException('Valor no estaba asignado');
    }

    return ok(null, 'Valor desasignado del atributo');
  }
}
