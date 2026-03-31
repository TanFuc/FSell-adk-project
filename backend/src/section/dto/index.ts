import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
  IsObject,
  IsArray,
  IsUrl,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LayoutType } from '@prisma/client';

export class CreateSectionDto {
  @ApiProperty({
    description: 'Unique identifier key',
    example: 'hero_main',
  })
  @IsString({ message: 'Key must be a string' })
  @IsNotEmpty({ message: 'Key is required' })
  @MaxLength(100, { message: 'Key must not exceed 100 characters' })
  key: string;

  @ApiProperty({
    enum: LayoutType,
    description: 'Layout type',
    example: 'HERO_IMAGE',
  })
  @IsEnum(LayoutType, { message: 'Invalid layout type' })
  layoutType: LayoutType;

  @ApiProperty({
    description: 'Content (title, subtitle, richText)',
    example: {
      title: 'ADK - Your destination for healthy living',
      subtitle: 'GPP Pharmacy Model',
    },
  })
  @IsObject({ message: 'Content must be a JSON object' })
  content: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'List of image URLs',
    example: ['/images/hero.jpg'],
  })
  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  @IsString({ each: true, message: 'Each image URL must be a string' })
  images?: string[];

  @ApiPropertyOptional({
    description: 'CTA link (redirect URL)',
    example: 'https://bizmall.vn',
  })
  @IsOptional()
  @IsUrl({}, { message: 'CTA Link must be a valid URL' })
  ctaLink?: string;

  @ApiPropertyOptional({
    description: 'Display order',
    example: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Sort order must be an integer' })
  @Min(0, { message: 'Sort order cannot be negative' })
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Show or hide',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Visibility must be true/false' })
  isVisible?: boolean;
}

export class UpdateSectionDto {
  @ApiPropertyOptional({
    enum: LayoutType,
    description: 'Layout type',
  })
  @IsOptional()
  @IsEnum(LayoutType, { message: 'Invalid layout type' })
  layoutType?: LayoutType;

  @ApiPropertyOptional({
    description: 'Content (title, subtitle, richText)',
  })
  @IsOptional()
  content?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'List of image URLs',
  })
  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  @IsString({ each: true, message: 'Each image URL must be a string' })
  images?: string[];

  @ApiPropertyOptional({
    description: 'CTA link (redirect URL)',
  })
  @IsOptional()
  @IsString({ message: 'CTA Link must be a string' })
  ctaLink?: string | null;

  @ApiPropertyOptional({
    description: 'Display order',
  })
  @IsOptional()
  @IsInt({ message: 'Sort order must be an integer' })
  @Min(0, { message: 'Sort order cannot be negative' })
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Show or hide',
  })
  @IsOptional()
  @IsBoolean({ message: 'Visibility must be true/false' })
  isVisible?: boolean;
}

export class ReorderItemDto {
  @ApiProperty({ description: 'Section ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'New order' })
  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderDto {
  @ApiProperty({ type: [ReorderItemDto], description: 'List of sections to reorder' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
