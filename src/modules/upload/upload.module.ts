import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ServiceCommonModule } from '../../common/services/service.module';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  imports: [ServiceCommonModule],
})
export class UploadModule {}
