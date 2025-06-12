import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { LoginUserDto } from '../user/dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from './dto/jwt-payload.dto';
import { RegisterUserDto } from '../user/dto/register-user.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { Prisma } from '@prisma/client';
import { JwtPayloadCustomer } from './dto/jwt-payload-customer.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { SellerRequestDto } from '../seller/dto/seller-request.dto';
import { RegisterSellerDto } from '../seller/dto/register-seller-account.dto';
import { Request, Response } from 'express';
import { UserService } from '../user/user.service';
import { SellerService } from '../seller/seller.service';
import { ok } from 'src/common/helpers/response.helper';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly sellerService: SellerService,
  ) {}

  // Login de usuario
  async loginUser(dto: LoginUserDto, res: Response, req: Request) {
    const user = await this.userService.findOneByEmail(dto.email);

    const isValid = user && (await bcrypt.compare(dto.password, user.password));

    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.prisma.loginAttempt.create({
      data: {
        loginInput: dto.email,
        status: isValid ? 'SUCCESS' : 'FAIL',
        ipAddress: req.ip ?? '',
        userId: user?.id ?? null,
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    const token = await this.jwtService.signAsync(payload);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return ok(
      {
        id: user.id,
        email: user.email,
        role: user.role.name,
      },
      'Usuario autenticado exitosamente',
    );
  }

  // Registro de usuario
  async registerUser(dto: RegisterUserDto) {
    const user = await this.userService.createUser(dto);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    const token = await this.jwtService.signAsync(payload);
    return {
      message: 'Usuario registrado exitosamente ',
      status: HttpStatus.CREATED,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role.name,
        },
      },
      token,
    };
  }

  // crear vendedor por administrador

  //Enviar solicitud de registro como vendedor
  async requestSeller(dto: SellerRequestDto) {
    const exists = await this.sellerService.findOneByEmailOrPhone(dto);

    if (exists)
      throw new ConflictException(
        'Ya existe una solicitud con ese email o teléfono',
      );

    const request = await this.sellerService.createSellerRequest(dto);

    // TODO: enviar notificación de solicitud recibida
    return {
      message: 'Solicitud de registro como vendedor enviada exitosamente',
      status: HttpStatus.CREATED,
      request: request.id,
    };
  }

  //Aprobación de solicitud por superadmin/admin recruiter
  async approveSellerRequest(id: number) {
    const request = await this.sellerService.findRequestById(id);

    if (request.approvedAt) {
      throw new ConflictException('La solicitud ya fue aprobada');
    }

    const link = await this.sellerService.aproveSellerRequest(id);
    return {
      message: 'Solicitud aprobada exitosamente. Enlace de registro enviado.',
      status: HttpStatus.OK,
      link,
    };
  }

  //Registro automático en checkout

  async registerSellerAccount(dto: RegisterSellerDto) {
    const request = await this.sellerService.findRequestByToken(dto);

    const exists = await this.sellerService.findExistingRequestByEmail(
      request.email ?? '',
    );

    if (exists) {
      throw new ConflictException('Ya existe un usuario con este email');
    }

    const user = await this.sellerService.createSellerAccount(request, dto);

    await this.sellerService.updatedRequestCompleted(request.id);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Cuenta de vendedor creada exitosamente',
      status: HttpStatus.CREATED,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role.name,
        },
      },
      token,
    };
  }

  // Registro de cliente
  async registerCustomer(dto: RegisterCustomerDto) {
    const conditions: Prisma.CustomerWhereInput[] = [{ phone: dto.phone }];

    if (dto.email) {
      conditions.push({ email: dto.email });
    }

    const existing = await this.prisma.customer.findFirst({
      where: {
        OR: conditions,
      },
    });
    if (existing) {
      throw new BadRequestException(
        'Ya existe un cliente con este número o correo electrónico',
      );
    }
    const hashedPassword = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : null;
    const customer = await this.prisma.customer.create({
      data: {
        phone: dto.phone,
        name: dto.name ?? '',
        email: dto.email,
        password: hashedPassword,
      },
    });
    const payload: JwtPayloadCustomer = {
      sub: customer.id,
      email: customer.email,
    };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Cliente registrado exitosamente',
      status: HttpStatus.CREATED,
      token,
    };
  }

  // Login de cliente
  async loginCustomer(dto: LoginCustomerDto) {
    const { identifier, password } = dto;
    const isEmail = identifier.includes('@');

    const customer = await this.prisma.customer.findUnique({
      where: isEmail ? { email: identifier } : { phone: identifier },
    });

    if (!customer?.password) {
      throw new UnauthorizedException(
        'Tu cuenta aún no tiene acceso. Solicita una contraseña temporal o regístrate',
      );
    }
    const isValid = await bcrypt.compare(password, customer.password);
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const payload: JwtPayloadCustomer = {
      sub: customer.id,
      email: customer.email,
    };

    const token = await this.jwtService.signAsync(payload);
    return { token, customer, status: HttpStatus.OK };
  }

  async registerCustomerFromCheckout(dto: CheckoutDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException(
        'Debes proporcionar al menos un email o teléfono',
      );
    }
    let customer = await this.prisma.customer.findFirst({
      where: {
        OR: [
          { phone: dto.phone },
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          email: dto.email,
          phone: dto.phone ?? '',
          name: dto.name,
          isTemporaryPassword: true,
        },
      });
      await this.prisma.address.create({
        data: {
          customerId: customer.id,
          addressLine: dto.address.addressLine,
          district: dto.address.district,
          city: dto.address.city,
          phone: dto.address.phone,
        },
      });

      // TODO: enviar enlace o contraseña temporal
    }
    return {
      customer: customer.id,
      message: 'Cliente registrado o encontrado exitosamente',
      status: HttpStatus.CREATED,
    };
  }
}
