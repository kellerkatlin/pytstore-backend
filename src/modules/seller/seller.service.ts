import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SellerRequest } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RegisterSellerDto } from './dto/register-seller-account.dto';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { SellerRequestDto } from './dto/seller-request.dto';
import { ReferralService } from 'src/common/referral/referral.service';
import { FilterSellerDto } from './dto/filter-seller.dto';
import { created, ok, paginated } from 'src/common/helpers/response.helper';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';

@Injectable()
export class SellerService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly referralService: ReferralService,
  ) {}

  async createSellerAccount(request: SellerRequest, dto: RegisterSellerDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const referralCode = await this.referralService.generateReferralCode(
      dto.name,
    );
    const user = await this.prisma.user.create({
      data: {
        email: request.email ?? '',
        name: dto.name,
        referralCode,
        password: hashedPassword,
        role: {
          connect: { name: 'SELLER' },
        },
        seller: {
          create: {
            businessName: dto.name,
            ruc: dto.ruc,
            description: dto.description,
            logoUrl: dto.logoUrl, // Logo URL placeholder, should be provided
            storeName: dto.storeName, // Store name placeholder, should be provided
          },
        },
      },
      include: { role: true },
    });
    if (!user) {
      throw new NotFoundException('Error al crear la cuenta de vendedor');
    }
    return user;
  }

  async createSellerRequest(dto: SellerRequestDto) {
    const request = await this.prisma.sellerRequest.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        name: dto.name,
        message: dto.message,
      },
    });
    if (!request) {
      throw new NotFoundException('Error al crear la solicitud de vendedor');
    }
    return request;
  }

  async findRequestByToken(dto: RegisterSellerDto) {
    const request = await this.prisma.sellerRequest.findFirst({
      where: {
        creationToken: dto.token,
        tokenExpiresAt: { gte: new Date() },
      },
    });
    if (!request) {
      throw new BadRequestException(
        'Token de solicitud de vendedor inválido o expirado',
      );
    }
    return request;
  }

  async findOneByEmailOrPhone(dto: SellerRequestDto) {
    const exists = await this.prisma.sellerRequest.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    return exists;
  }

  async findExistingRequestByEmail(email: string) {
    const exists = await this.prisma.sellerRequest.findFirst({
      where: {
        email,
        completedAt: null,
      },
    });

    return exists;
  }

  async updatedRequestCompleted(requestId: number) {
    const request = await this.prisma.sellerRequest.update({
      where: { id: requestId },
      data: {
        completedAt: new Date(),
        creationToken: null,
        tokenExpiresAt: null,
      },
    });

    if (!request) {
      throw new NotFoundException('Solicitud de vendedor no encontrada');
    }

    return request;
  }

  async findRequestById(id: number) {
    const request = await this.prisma.sellerRequest.findUniqueOrThrow({
      where: { id },
    });

    return request;
  }

  async aproveSellerRequest(id: number) {
    const request = await this.findRequestById(id);

    if (request.approvedAt) {
      throw new ConflictException('La solicitud ya fue aprobada');
    }

    const token = randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 horas
    await this.prisma.sellerRequest.update({
      where: { id },
      data: {
        approvedAt: new Date(),
        creationToken: token,
        tokenExpiresAt: expires,
      },
    });
    const link = `https://tuapp.com/alta-vendedor?token=${token}`;
    console.log(`Enlace de registro: ${link}`);

    return link;
  }

  /// === Seller desde el admin ===
  async findAll(query: FilterSellerDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SellerWhereInput = {
      isDeleted: false,
      user: {
        isActive: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      ...(search && {
        OR: [
          { businessName: { contains: search, mode: 'insensitive' } },
          { storeName: { contains: search, mode: 'insensitive' } },
          { ruc: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [sellers, total] = await this.prisma.$transaction([
      this.prisma.seller.findMany({
        where,
        skip,
        take: +limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          businessName: true,
          storeName: true,
          ruc: true,
          description: true,

          logoUrl: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              username: true,
            },
          },
        },
      }),
      this.prisma.seller.count({ where }),
    ]);

    return paginated(
      sellers,
      {
        page,
        total,
        lastPage: Math.ceil(total / limit),
      },
      'Vendedores encontrados',
    );
  }

  async create(dto: CreateSellerDto) {
    // Validar que no exista un usuario con el mismo email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con este email');
    }

    // Validar que no exista un vendedor con el mismo RUC
    if (dto.ruc) {
      const existingSeller = await this.prisma.seller.findUnique({
        where: { ruc: dto.ruc },
      });
      if (existingSeller) {
        throw new ConflictException('Ya existe un vendedor con este RUC');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const referralCode = await this.referralService.generateReferralCode(
      dto.name,
    );

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        phone: dto.phone,
        password: hashedPassword,
        referralCode,
        role: {
          connect: { name: 'SELLER' },
        },
        seller: {
          create: {
            businessName: dto.businessName ?? dto.name,
            ruc: dto.ruc,
            storeName: dto.storeName,
            description: dto.description ?? '',
            logoUrl: dto.logoUrl ?? '',
          },
        },
      },
      include: {
        role: true,
        seller: true,
      },
    });

    return created(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role.name,
        },
        seller: {
          id: user.seller?.id,
          ruc: user.seller?.ruc,
          storeName: user.seller?.storeName,
        },
      },
      'Vendedor creado correctamente',
    );
  }

  async update(userId: number, dto: UpdateSellerDto) {
    const updates: Prisma.UserUpdateInput = {
      ...(dto.email && { email: dto.email }),
      ...(dto.phone && { phone: dto.phone }),
      ...(dto.name && { name: dto.name }),
      ...(dto.password && {
        password: await bcrypt.hash(dto.password, 10),
      }),
      seller: {
        update: {
          ...(dto.storeName && { storeName: dto.storeName }),
          ...(dto.businessName && { businessName: dto.businessName }),
          ...(dto.ruc && { ruc: dto.ruc }),
          ...(dto.description && { description: dto.description }),
          ...(dto.logoUrl && { logoUrl: dto.logoUrl }),
        },
      },
    };

    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
          NOT: { id: userId },
        },
      });
      if (existing) {
        throw new ConflictException('El email ya está en uso por otro usuario');
      }
    }

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: {
          phone: dto.phone,
          NOT: { id: userId },
        },
      });
      if (existingPhone) {
        throw new ConflictException(
          'El teléfono ya está en uso por otro usuario',
        );
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updates,
      include: { seller: true },
    });

    return ok(updated, 'Vendedor actualizado correctamente');
  }

  async findOne(id: number) {
    const seller = await this.prisma.seller.findUnique({
      where: { id },
      select: {
        id: true,
        businessName: true,
        storeName: true,
        ruc: true,
        description: true,
        logoUrl: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!seller) {
      throw new NotFoundException('Vendedor no encontrado');
    }

    return ok(seller, 'Detalle de vendedor cargado correctamente');
  }

  async remove(id: number) {
    const seller = await this.prisma.seller.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!seller) {
      throw new NotFoundException('Vendedor no encontrado');
    }

    // Desactivar usuario asociado
    await this.prisma.user.update({
      where: { id: seller.userId },
      data: { isActive: false },
    });

    await this.prisma.seller.update({
      where: { id },
      data: { isDeleted: true },
    });
    return ok(
      { sellerId: id, userId: seller.userId },
      'Vendedor desactivado correctamente',
    );
  }
}
