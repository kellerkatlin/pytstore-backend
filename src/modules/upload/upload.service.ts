import { Injectable } from '@nestjs/common';
import { S3Service } from '../../common/services/s3/s3.service';

@Injectable()
export class UploadService {
  constructor(private readonly s3Service: S3Service) {}

  async getPresignedUrl(filename: string, contentType: string) {
    const bucket = process.env.R2_BUCKET ?? 'bucket-kellerkatlin';
    const slug = `uploads/${crypto.randomUUID()}`;

    const url = await this.s3Service.generatePresignedUrl(
      bucket,
      slug,
      contentType,
    );
    const finalUrl = `${process.env.R2_ENDPOINT}/${slug}`;

    return { url, finalUrl };
  }
  async deleteFileByUrl(imageUrl: string): Promise<void> {
    const bucket = process.env.R2_BUCKET!;
    const baseUrl = `${process.env.R2_ENDPOINT}/`;

    if (!imageUrl.startsWith(baseUrl)) {
      throw new Error('URL no pertenece al bucket configurado');
    }

    const key = imageUrl.replace(baseUrl, '');
    await this.s3Service.deleteObject(bucket, key);
  }
}
