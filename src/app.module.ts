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
import { InventoryModule } from './modules/inventory/inventory.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { StockService } from './common/services/stock/stock.service';
import { StockModule } from './common/services/stock/stock.module';
import { SaleModule } from './modules/sale/sale.module';
import { CommissionModule } from './modules/commission/commission.module';
import { WithdrawalModule } from './modules/withdrawal/withdrawal.module';

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
    InventoryModule,
    PurchaseModule,
    StockModule,
    SaleModule,
    CommissionModule,
    WithdrawalModule,
  ],
  controllers: [AppController, SellerController],
  providers: [AppService, PrismaService, SellerService, StockService],
})
export class AppModule {}
