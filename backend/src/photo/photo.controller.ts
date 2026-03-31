import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Photo } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { memoryStorage } from 'multer';
import { PhotoService } from './photo.service';
import { CreatePhotoDto, UpdatePhotoDto, ReorderDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { R2ImageUploadService } from './r2-image-upload.service';

@ApiTags('Photo')
@Controller('photo')
@SkipThrottle()
export class PhotoController {
  constructor(
    private readonly photoService: PhotoService,
    private readonly r2ImageUploadService: R2ImageUploadService,
  ) {}

  // Public endpoints
  @Get('public')
  @ApiOperation({ summary: 'Get all visible photos (Public)' })
  @ApiResponse({ status: 200, description: 'Photo list with categories' })
  async findAllPublic() {
    return this.photoService.findAllPublic();
  }

  @Get('public/category/:slug')
  @ApiOperation({ summary: 'Get photos by category slug (Public)' })
  async findByCategorySlug(@Param('slug') slug: string) {
    return this.photoService.findByCategorySlug(slug);
  }

  // Admin endpoints
  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all photos (Admin)' })
  async findAll() {
    return this.photoService.findAll();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get photo details (Admin)' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.photoService.findOne(id);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new photo (Admin)' })
  async create(@Body() dto: CreatePhotoDto): Promise<Photo> {
    return this.photoService.create(dto);
  }

  @Post('admin/upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload and optimize image to Cloudflare R2 (Admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype?.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.r2ImageUploadService.uploadImage(file.buffer, file.originalname);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update photo (Admin)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePhotoDto,
  ): Promise<Photo> {
    return this.photoService.update(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete photo (Admin)' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.photoService.delete(id);
  }

  @Patch('admin/:id/toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle photo visibility (Admin)' })
  async toggle(@Param('id', ParseUUIDPipe) id: string): Promise<Photo> {
    return this.photoService.toggle(id);
  }

  @Patch('admin/reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder photos (Admin)' })
  async reorder(@Body() dto: ReorderDto): Promise<void> {
    return this.photoService.reorder(dto);
  }
}
