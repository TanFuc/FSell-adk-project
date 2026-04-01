// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
  };
}

export interface ApiError {
  success: boolean;
  error: {
    statusCode: number;
    message: string;
    details: string | string[] | null;
    path: string;
    timestamp: string;
  };
}

export interface StreamLogEntry {
  id: string;
  level: "debug" | "log" | "warn" | "error";
  scope: string;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

// Registration Types
export interface RegistrationRequest {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  address?: string;
}

export interface RegistrationResponse {
  id: string;
  message: string;
  redirectUrl?: string;
}

export type RegistrationStatus = "PENDING" | "CONTACTED" | "SUCCESSFUL" | "REJECTED";

export interface Registration {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  address?: string;
  status: RegistrationStatus;
  source: string;
  registeredAt: string;
  updatedAt: string;
}

export interface RegistrationStats {
  total: number;
  pending: number;
  contacted: number;
  successful: number;
  rejected: number;
}

// Content Types
export type ContentType = "HERO" | "FEATURE" | "STATISTIC" | "FAQ" | "PARTNER" | "TESTIMONIAL";

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  content: Record<string, unknown>;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  admin: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

// Location Types
export interface Province {
  value: string;
  label: string;
}

export interface District {
  value: string;
  label: string;
}

// Page Section Types
export type LayoutType =
  | "HERO_VIDEO"
  | "HERO_IMAGE"
  | "SPLIT_IMAGE_TEXT"
  | "BENTO_GRID"
  | "CAROUSEL"
  | "MASONRY_GRID"
  | "TEXT_ONLY"
  | "CTA_BANNER";

export interface Section {
  id: string;
  key: string;
  layoutType: LayoutType;
  content: Record<string, unknown>;
  images: string[];
  ctaLink?: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// Popup Banner Types
export interface BannerPopup {
  id: string;
  imageUrl: string;
  redirectUrl: string;
  isActive: boolean;
  displayDelay: number;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

// Campaign Event Types
export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  coverImage: string;
  gallery: string[];
  content?: Record<string, unknown>;
  redirectUrl?: string; // URL to redirect when clicking "Xem chi tiết"
  isFeatured: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// Global Settings Types
export interface Configuration {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description?: string;
}

// Business Model Types
export interface BusinessModel {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  profitPotential?: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// Partnership FAQ Types
export interface PartnershipFaq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// Reorder Types
export interface ReorderItem {
  id: string;
  sortOrder: number;
}

// Photo Gallery Types
export interface PhotoCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isVisible: boolean;
  photoCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// Site Branding Types
export interface SiteBranding {
  logoUrl?: string;
  siteName?: string;
  tagline?: string;
  faviconUrl?: string;
}

// Navbar Link Types
export interface NavbarLink {
  href: string;
  label: string;
  isVisible: boolean;
  sortOrder: number;
}

// Footer Link Types
export interface FooterLinks {
  explore?: NavbarLink[];
  partnership?: NavbarLink[];
}

// Contact Info Types
export interface ContactInfo {
  hotline?: string;
  email?: string;
  address?: string;
}

// Social Links Types
export interface SocialLinks {
  facebook?: string;
  youtube?: string;
  zalo?: string;
  tiktok?: string;
}

// Admin User Types
export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: "SUPER_ADMIN" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminUserRequest {
  email: string;
  password: string;
  fullName: string;
  role?: "SUPER_ADMIN" | "ADMIN";
}

export interface UpdateAdminUserRequest {
  email?: string;
  fullName?: string;
  role?: "SUPER_ADMIN" | "ADMIN";
  isActive?: boolean;
}

// Legacy types for backward compatibility (deprecated - will be removed)
export type DangKyRequest = RegistrationRequest;
export type DangKyResponse = RegistrationResponse;
export type TrangThai = RegistrationStatus;
export type DangKyDetail = Registration;
export type DangKyStats = RegistrationStats;
export type LoaiNoiDung = ContentType;
export type NoiDung = Content;
export type LoaiBoCuc = LayoutType;
export type PhanMuc = Section;
export type SuKien = Event;
export type CauHinh = Configuration;
export type MoHinhKinhDoanh = BusinessModel;
export type HoiDapHopTac = PartnershipFaq;
