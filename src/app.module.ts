import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { PrismaService } from './common/prisma/prisma.service';
import { UserModule } from './modules/user/user.module';
import { SellerService } from './modules/seller/seller.service';
import { SellerController } from './modules/seller/seller.controller';
import { SellerModule } from './modules/seller/seller.module';
import { ReferralModule } from './common/referral/referral.module';
import { CategoryModule } from './modules/category/category.module';
import { BrandModule } from './modules/brand/brand.module';
import { ProductModule } from './modules/product/product.module';
import { AttributeModule } from './modules/attribute/attribute.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UserModule,
    SellerModule,
    ReferralModule,
    CategoryModule,
    BrandModule,
    ProductModule,
    AttributeModule,
  ],
  controllers: [AppController, SellerController],
  providers: [AppService, PrismaService, SellerService],
})
export class AppModule {}
