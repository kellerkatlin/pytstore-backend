import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {
  private readonly endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  private readonly s3 = new S3Client({
    endpoint: this.endpoint,
    region: process.env.R2_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY!,
      secretAccessKey: process.env.R2_SECRET_KEY!,
    },

    forcePathStyle: true,
  });

  async generatePresignedUrl(bucket: string, key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });
    return await getSignedUrl(this.s3, command, { expiresIn: 300 });
  }

  makePublicUrl(bucket: string, key: string) {
    return `${this.endpoint}/${bucket}/${encodeURIComponent(key)}`;
  }

  async deleteObject(bucket: string, key: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }
}
