import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

import { RegisterUserDto } from './dto/register-user.dto';
import { ReferralService } from 'src/common/referral/referral.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly referralService: ReferralService,
  ) {}

  async findOneByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        seller: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }

    return user;
  }

  async createUser(dto: RegisterUserDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const referralCode = await this.referralService.generateReferralCode(
      dto.name,
    );
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        referralCode,
        role: {
          connect: { id: dto.roleId },
        },
      },
      include: { role: true },
    });
    if (!user) {
      throw new NotFoundException('Error al crear el usuario');
    }
    return user;
  }
  findAll() {
    return this.prisma.user.findMany();
  }
}
