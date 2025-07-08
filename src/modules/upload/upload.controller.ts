import { Controller, Post, Body, Delete } from '@nestjs/common';
import { UploadService } from './upload.service';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';
import { ok } from '../../common/helpers/response.helper';

@Controller('upload')
export class UploadController {
  constructor(private readonly service: UploadService) {}

  @Auth('SUPERADMIN', 'ADMIN')
  @Post('presign')
  async getPresignedUrl(
    @Body() body: { filename: string; contentType: string },
  ) {
    const result = await this.service.getPresignedUrl(
      body.filename,
      body.contentType,
    );

    return ok(result, 'URL prefirmada obtenida correctamente');
  }

  @Delete('remove-by-url')
  async deleteByUrl(@Body() body: { imageUrl: string }) {
    await this.service.deleteFileByUrl(body.imageUrl);
    return ok(null, 'Imagen eliminada de R2 correctamente');
  }
}
