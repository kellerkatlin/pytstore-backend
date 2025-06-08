import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SellerRequest } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RegisterSellerDto } from './dto/register-seller-account.dto';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { SellerRequestDto } from './dto/seller-request.dto';
import { ReferralService } from 'src/common/referral/referral.service';

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
}
