import { Module } from '@nestjs/common';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { AuthModule } from '../auth/auth.module';
import { R2ImageUploadService } from './r2-image-upload.service';

@Module({
  imports: [AuthModule],
  controllers: [PhotoController],
  providers: [PhotoService, R2ImageUploadService],
  exports: [PhotoService],
})
export class PhotoModule {}
