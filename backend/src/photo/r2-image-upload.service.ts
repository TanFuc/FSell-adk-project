import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import sharp = require('sharp');

@Injectable()
export class R2ImageUploadService {
  private readonly maxWidth: number;
  private readonly quality: number;

  constructor(private readonly configService: ConfigService) {
    this.maxWidth = Number(this.configService.get<string>('IMAGE_MAX_WIDTH') || 2560);
    this.quality = Number(this.configService.get<string>('IMAGE_QUALITY') || 88);
  }

  async uploadImage(fileBuffer: Buffer, originalName: string) {
    const { s3Client, bucket, publicUrl } = this.getR2ClientConfig();
    const optimized = await this.optimizeImage(fileBuffer);
    const key = this.generateObjectKey(originalName);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: optimized,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await s3Client.send(command);

    const imageUrl = publicUrl ? `${publicUrl}/${key}` : key;

    return {
      key,
      imageUrl,
      contentType: 'image/webp',
      size: optimized.length,
    };
  }

  private async optimizeImage(fileBuffer: Buffer): Promise<Buffer> {
    try {
      const input = this.normalizeToBuffer(fileBuffer);

      if (!input.length) {
        throw new BadRequestException('Uploaded image is empty');
      }

      return await sharp(input)
        .rotate()
        .resize({
          width: this.maxWidth,
          fit: 'inside',
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3,
        })
        .sharpen({ sigma: 1.1, m1: 1.2, m2: 2.0, x1: 2.0, y2: 10.0, y3: 20.0 })
        .webp({ quality: this.quality, effort: 5, smartSubsample: true })
        .toBuffer();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Invalid image file or unsupported format');
    }
  }

  private normalizeToBuffer(input: unknown): Buffer {
    if (Buffer.isBuffer(input)) {
      return input;
    }

    if (input instanceof Uint8Array) {
      return Buffer.from(input);
    }

    if (input instanceof ArrayBuffer) {
      return Buffer.from(input);
    }

    if (
      typeof input === 'object' &&
      input !== null &&
      'type' in input &&
      'data' in input &&
      (input as { type?: string }).type === 'Buffer' &&
      Array.isArray((input as { data?: unknown[] }).data)
    ) {
      return Buffer.from((input as { data: number[] }).data);
    }

    return Buffer.alloc(0);
  }

  private getR2ClientConfig() {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_KEY');
    const secretAccessKey = this.configService.get<string>('R2_SECRET');
    const bucket = this.configService.get<string>('R2_BUCKET');

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      throw new ServiceUnavailableException(
        'R2 upload is not configured. Missing R2_ENDPOINT, R2_KEY, R2_SECRET or R2_BUCKET',
      );
    }

    const s3Client = new S3Client({
      region: this.configService.get<string>('R2_REGION') || 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    return {
      s3Client,
      bucket,
      publicUrl: (this.configService.get<string>('R2_PUBLIC_URL') || '').replace(/\/$/, ''),
    };
  }

  private generateObjectKey(originalName: string): string {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).slice(2, 10);
    const safeName = originalName
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60);

    return `uploads/${new Date().toISOString().slice(0, 10)}/${safeName || 'image'}-${timestamp}-${randomPart}.webp`;
  }
}
