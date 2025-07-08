import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { SellerRequestDto } from '../seller/dto/seller-request.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { RegisterUserDto } from '../user/dto/register-user.dto';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { RegisterSellerDto } from '../seller/dto/register-seller-account.dto';
import { Request, Response } from 'express';
import { JwtPayload } from './dto/jwt-payload.dto';
import { Auth } from './decorators/auth.decorator';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { ok } from 'src/common/helpers/response.helper';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login-user')
  async loginUser(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.authService.loginUser(dto, res, req);
  }

  @Auth('SUPERADMIN', 'SELLER')
  @Get('me')
  getProfile(@ActiveUser() user: JwtPayload) {
    return ok(user, 'Perfil obtenido correctamente');
  }

  @Post('register-user')
  async registerUser(
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.registerUser(dto, res);
  }

  @Post('request-seller')
  async requestSeller(@Body() dto: SellerRequestDto) {
    return this.authService.requestSeller(dto);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Post('aprove-seller/:id')
  async aproveSeller(@Param('id') id: number) {
    return this.authService.approveSellerRequest(id);
  }

  @Auth('SUPERADMIN', 'ADMIN')
  @Post('register-seller')
  async registerSeller(
    @Body() dto: RegisterSellerDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.registerSellerAccount(dto, res);
  }

  @Post('login-customer')
  async loginCustomer(@Body() dto: LoginCustomerDto) {
    return this.authService.loginCustomer(dto);
  }

  @Post('register-customer-checkout')
  async registerCustomerCheckout(@Body() dto: CheckoutDto) {
    return this.authService.registerCustomerFromCheckout(dto);
  }

  @Post('register-customer')
  async registerCustomer(@Body() dto: RegisterCustomerDto) {
    return this.authService.registerCustomer(dto);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return ok(null, 'Sesión cerrada correctamente');
  }
}
