import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { created, ok, paginated } from 'src/common/helpers/response.helper';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly select = {
    id: true,
    name: true,
    email: true,
    phone: true,
    dni: true,
    ruc: true,
    isDeleted: true,
    customerType: true,
    addresses: {
      take: 1,
      select: {
        addressLine: true,
        district: true,
        department: true,

        province: true,
        reference: true,
      },
    },
  };

  private async getById(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer || customer.isDeleted) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return customer;
  }

  async create(dto: CreateCustomerDto) {
    if (dto.customerType === 'NATURAL') {
      if (dto.ruc)
        throw new ConflictException(
          'No debe registrar RUC para personas naturales',
        );
    }

    if (dto.customerType === 'JURIDICAL') {
      if (dto.dni)
        throw new ConflictException(
          'No debe registrar DNI para personas jurídicas',
        );
    }

    const existing = await this.prisma.customer.findFirst({
      where: {
        OR: [
          { email: dto.email ?? undefined },
          { phone: dto.phone },
          { dni: dto.dni ?? undefined },
          { ruc: dto.ruc ?? undefined },
        ],
        isDeleted: false,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe un cliente con el mismo email, teléfono, DNI o RUC.',
      );
    }

    const customer = await this.prisma.customer.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        dni: dto.dni ?? null,
        ruc: dto.ruc ?? null,
        customerType: dto.customerType,
        addresses: {
          create: dto.addresses.map((addr) => ({
            addressLine: addr.addressLine ?? '',
            district: addr.district ?? '',
            department: addr.department ?? '',
            province: addr.province ?? '',
            phone: dto.phone,
          })),
        },
      },
      select: this.select,
    });
    return created(customer, 'Cliente creado exitosamente');
  }

  async findAll(
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'id',
    order: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        skip,
        take: +limit,
        orderBy: { [sortBy]: order },
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        },
        select: this.select,
      }),
      this.prisma.customer.count({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return paginated(
      data,
      { total, page, lastPage: Math.ceil(total / limit) },
      'Listado de clientes obtenido correctamente',
    );
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: {
        ...this.select,
        addresses: {
          select: {
            id: true,
            addressLine: true,
            district: true,
            department: true,
            province: true,
            reference: true,
            phone: true,
          },
        },
      },
    });

    if (!customer || customer.isDeleted) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return ok(customer, 'Cliente obtenido correctamente');
  }

  async update(id: number, dto: UpdateCustomerDto) {
    const customer = await this.getById(id);

    // Validación de email duplicado
    if (dto.email && dto.email !== customer.email) {
      const exists = await this.prisma.customer.findFirst({
        where: {
          email: dto.email,
          isDeleted: false,
          NOT: { id },
        },
      });
      if (exists) throw new ConflictException('El email ya está en uso');
    }

    // Validación de teléfono duplicado
    if (dto.phone && dto.phone !== customer.phone) {
      const exists = await this.prisma.customer.findFirst({
        where: {
          phone: dto.phone,
          isDeleted: false,
          NOT: { id },
        },
      });
      if (exists) throw new ConflictException('El teléfono ya está en uso');
    }

    // Validación de dni duplicado
    if (dto.dni && dto.dni !== customer.dni) {
      const exists = await this.prisma.customer.findFirst({
        where: {
          dni: dto.dni,
          isDeleted: false,
          NOT: { id },
        },
      });
      if (exists) throw new ConflictException('El DNI ya está en uso');
    }

    // Validación de ruc duplicado
    if (dto.ruc && dto.ruc !== customer.ruc) {
      const exists = await this.prisma.customer.findFirst({
        where: {
          ruc: dto.ruc,
          isDeleted: false,
          NOT: { id },
        },
      });
      if (exists) throw new ConflictException('El RUC ya está en uso');
    }

    const type = dto.customerType ?? customer.customerType;

    if (type === 'NATURAL') {
      if (dto.ruc)
        throw new ConflictException(
          'No debe registrar RUC para personas naturales',
        );
    }

    if (type === 'JURIDICAL') {
      if (dto.dni)
        throw new ConflictException(
          'No debe registrar DNI para personas jurídicas',
        );
    }

    const updated = await this.prisma.customer.update({
      where: { id },
      data: {
        ...dto,
        dni: dto.dni ?? null,
        ruc: dto.ruc ?? null,
        addresses: dto.addresses
          ? {
              deleteMany: {}, // elimina todas las direcciones anteriores
              create: dto.addresses.map((addr) => ({
                addressLine: addr.addressLine ?? '',
                district: addr.district ?? '',
                department: addr.department ?? '',
                province: addr.province ?? '',
                reference: addr.reference ?? '',
                phone: dto.phone ?? customer.phone,
              })),
            }
          : undefined,
      },
      select: this.select,
    });

    return ok(updated, 'Cliente actualizado correctamente');
  }

  async remove(id: number) {
    await this.getById(id);

    await this.prisma.customer.update({
      where: { id },
      data: { isDeleted: true },
    });

    return ok(null, 'Cliente eliminado correctamente');
  }
}
