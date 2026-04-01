import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  LoginDto,
  LoginResponseDto,
  CreateAdminDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from './dto';
import { AdminRole } from '@prisma/client';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.jwtSecret = this.config.get<string>('JWT_SECRET') || 'adk-secret-key-2024';
    this.jwtExpiresIn = this.config.get<number>('JWT_EXPIRES_IN') || 86400; // 24 hours
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: dto.email },
    });

    if (!admin) {
      this.logger.warn(`Login failed - email not found: ${dto.email}`);
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!admin.isActive) {
      this.logger.warn(`Login failed - account disabled: ${dto.email}`);
      throw new UnauthorizedException('Account has been disabled.');
    }

    const isValid = this.verifyPassword(dto.password, admin.password);
    if (!isValid) {
      this.logger.warn(`Login failed - wrong password: ${dto.email}`);
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.generateToken({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    });

    this.logger.log(`Login successful: ${admin.email}`);

    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: this.jwtExpiresIn,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    };
  }

  async createAdmin(dto: CreateAdminDto): Promise<{ id: string; email: string }> {
    const existing = await this.prisma.adminUser.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email is already in use.');
    }

    const hashedPassword = this.hashPassword(dto.password);

    const admin = await this.prisma.adminUser.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        role: AdminRole.ADMIN,
      },
      select: { id: true, email: true },
    });

    this.logger.log(`Admin created: ${admin.email}`);

    return admin;
  }

  async getCurrentAdmin(
    userId: string,
  ): Promise<{ id: string; email: string; fullName: string; role: string }> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }

    return admin;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<{ id: string; email: string; fullName: string }> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }

    // Check if email is being changed and if it's already in use
    if (dto.email && dto.email !== admin.email) {
      const existing = await this.prisma.adminUser.findUnique({
        where: { email: dto.email },
      });

      if (existing) {
        throw new ConflictException('Email is already in use.');
      }
    }

    const updated = await this.prisma.adminUser.update({
      where: { id: userId },
      data: {
        email: dto.email,
        fullName: dto.fullName,
      },
      select: { id: true, email: true, fullName: true },
    });

    this.logger.log(`Profile updated: ${updated.email}`);

    return updated;
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }

    // Verify current password
    const isValid = this.verifyPassword(dto.currentPassword, admin.password);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect.');
    }

    // Check if new password is different from current
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different from current password.');
    }

    // Hash and update password
    const hashedPassword = this.hashPassword(dto.newPassword);

    await this.prisma.adminUser.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    this.logger.log(`Password changed: ${admin.email}`);

    return { message: 'Password changed successfully.' };
  }

  async validateToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = this.verifyToken(token);

      // Check if admin still exists and is active
      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
        select: { id: true, isActive: true },
      });

      if (!admin || !admin.isActive) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':');
    const hashBuffer = Buffer.from(hash, 'hex');
    const suppliedBuffer = scryptSync(password, salt, 64);
    return timingSafeEqual(hashBuffer, suppliedBuffer);
  }

  private generateToken(payload: { sub: string; email: string; role: string }): string {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'HS256', typ: 'JWT' };

    const tokenPayload: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + this.jwtExpiresIn,
    };

    const headerBase64 = this.base64UrlEncode(JSON.stringify(header));
    const payloadBase64 = this.base64UrlEncode(JSON.stringify(tokenPayload));
    const signature = this.sign(`${headerBase64}.${payloadBase64}`);

    return `${headerBase64}.${payloadBase64}.${signature}`;
  }

  private verifyToken(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [headerBase64, payloadBase64, signature] = parts;
    const expectedSignature = this.sign(`${headerBase64}.${payloadBase64}`);

    if (signature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }

    const payload = JSON.parse(this.base64UrlDecode(payloadBase64)) as JwtPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }

    return payload;
  }

  private sign(data: string): string {
    const hmac = createHash('sha256');
    hmac.update(data + this.jwtSecret);
    return this.base64UrlEncode(hmac.digest());
  }

  private base64UrlEncode(data: string | Buffer): string {
    const str = typeof data === 'string' ? Buffer.from(data) : data;
    return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private base64UrlDecode(data: string): string {
    const padded = data + '='.repeat((4 - (data.length % 4)) % 4);
    return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
  }
}
