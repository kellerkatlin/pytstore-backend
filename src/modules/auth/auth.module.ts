import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { SellerModule } from '../seller/seller.module';
import { ReferralModule } from 'src/common/referral/referral.module';
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
    SellerModule,
    ReferralModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
