import axios, { AxiosError } from "axios";
import type {
  ApiResponse,
  ApiError,
  RegistrationRequest,
  RegistrationResponse,
  Registration,
  RegistrationStats,
  RegistrationStatus,
  Content,
  LoginRequest,
  LoginResponse,
  Section,
  BannerPopup,
  Event,
  BusinessModel,
  PartnershipFaq,
  Configuration,
  ReorderItem,
  Photo,
  PhotoCategory,
  AdminUser,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
} from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("admin");
      if (
        window.location.pathname.startsWith("/admin") &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// Public API
export const publicApi = {
  // Registration
  async createRegistration(data: RegistrationRequest): Promise<RegistrationResponse> {
    const response = await api.post<ApiResponse<RegistrationResponse>>("/registration", data);
    return response.data.data;
  },

  // Content
  async getPublicContent(): Promise<Record<string, Content[]>> {
    const response = await api.get<ApiResponse<Record<string, Content[]>>>("/content/public");
    return response.data.data;
  },

  async getContentByType(type: string): Promise<Content[]> {
    const response = await api.get<ApiResponse<Content[]>>(`/content/public/${type}`);
    return response.data.data;
  },

  // Config
  async getPublicConfig(): Promise<Record<string, unknown>> {
    const response = await api.get<ApiResponse<Record<string, unknown>>>("/configuration/public");
    return response.data.data;
  },

  // Page Sections
  async getPublicSections(): Promise<Section[]> {
    const response = await api.get<ApiResponse<Section[]>>("/section/public");
    return response.data.data;
  },

  // Banner Popup
  async getActivePopup(): Promise<BannerPopup | null> {
    const response = await api.get<ApiResponse<BannerPopup | null>>("/banner-popup/public/active");
    return response.data.data;
  },

  // Events
  async getPublicEvents(): Promise<Event[]> {
    const response = await api.get<ApiResponse<Event[]>>("/event/public");
    return response.data.data;
  },

  async getFeaturedEvents(): Promise<Event[]> {
    const response = await api.get<ApiResponse<Event[]>>("/event/public/featured");
    return response.data.data;
  },

  // Business Models
  async getPublicBusinessModels(): Promise<BusinessModel[]> {
    const response = await api.get<ApiResponse<BusinessModel[]>>("/business-model/public");
    return response.data.data;
  },

  // Partnership FAQs
  async getPublicFAQs(): Promise<PartnershipFaq[]> {
    const response = await api.get<ApiResponse<PartnershipFaq[]>>("/partnership-faq/public");
    return response.data.data;
  },

  // Photo Categories
  async getPublicPhotoCategories(): Promise<PhotoCategory[]> {
    const response = await api.get<ApiResponse<PhotoCategory[]>>("/photo-category/public");
    return response.data.data;
  },

  // Photos
  async getPublicPhotos(): Promise<Photo[]> {
    const response = await api.get<ApiResponse<Photo[]>>("/photo/public");
    return response.data.data;
  },

  async getPhotosByCategory(slug: string): Promise<Photo[]> {
    const response = await api.get<ApiResponse<Photo[]>>(`/photo/public/category/${slug}`);
    return response.data.data;
  },
};

// Auth API
export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>("/auth/login", data);
    return response.data.data;
  },

  async getMe(): Promise<{ id: string; email: string; fullName: string; role: string }> {
    const response = await api.get<
      ApiResponse<{ id: string; email: string; fullName: string; role: string }>
    >("/auth/me");
    return response.data.data;
  },

  async updateProfile(data: {
    fullName?: string;
    email?: string;
  }): Promise<{ id: string; email: string; fullName: string }> {
    const response = await api.patch<ApiResponse<{ id: string; email: string; fullName: string }>>(
      "/auth/profile",
      data
    );
    return response.data.data;
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await api.put<ApiResponse<{ message: string }>>("/auth/change-password", data);
    return response.data.data;
  },
};

// Admin API
export const adminApi = {
  // Registrations
  async getRegistrations(
    page = 1,
    limit = 20,
    status?: RegistrationStatus
  ): Promise<{ data: Registration[]; total: number; pages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append("status", status);
    const response = await api.get<
      ApiResponse<{ data: Registration[]; total: number; pages: number }>
    >(`/registration/admin?${params}`);
    return response.data.data;
  },

  async getRegistrationStats(): Promise<RegistrationStats> {
    const response = await api.get<ApiResponse<RegistrationStats>>("/registration/admin/stats");
    return response.data.data;
  },

  async getRegistrationById(id: string): Promise<Registration> {
    const response = await api.get<ApiResponse<Registration>>(`/registration/admin/${id}`);
    return response.data.data;
  },

  async updateRegistrationStatus(id: string, status: RegistrationStatus): Promise<Registration> {
    const response = await api.patch<ApiResponse<Registration>>(
      `/registration/admin/${id}/status`,
      {
        status,
      }
    );
    return response.data.data;
  },

  async deleteRegistration(id: string): Promise<void> {
    await api.delete(`/registration/admin/${id}`);
  },

  // Content
  async getAllContent(): Promise<Content[]> {
    const response = await api.get<ApiResponse<Content[]>>("/content/admin");
    return response.data.data;
  },

  async createContent(data: Partial<Content>): Promise<Content> {
    const response = await api.post<ApiResponse<Content>>("/content/admin", data);
    return response.data.data;
  },

  async updateContent(id: string, data: Partial<Content>): Promise<Content> {
    const response = await api.patch<ApiResponse<Content>>(`/content/admin/${id}`, data);
    return response.data.data;
  },

  async deleteContent(id: string): Promise<void> {
    await api.delete(`/content/admin/${id}`);
  },

  // === SECTIONS (Page Sections) ===
  async getAllSections(): Promise<Section[]> {
    const response = await api.get<ApiResponse<Section[]>>("/section/admin");
    return response.data.data;
  },

  async createSection(data: Partial<Section>): Promise<Section> {
    const response = await api.post<ApiResponse<Section>>("/section/admin", data);
    return response.data.data;
  },

  async updateSection(id: string, data: Partial<Section>): Promise<Section> {
    const response = await api.patch<ApiResponse<Section>>(`/section/admin/${id}`, data);
    return response.data.data;
  },

  async deleteSection(id: string): Promise<void> {
    await api.delete(`/section/admin/${id}`);
  },

  async reorderSections(items: ReorderItem[]): Promise<void> {
    await api.patch("/section/admin/reorder", { items });
  },

  // === BANNER POPUP ===
  async getAllBanners(): Promise<BannerPopup[]> {
    const response = await api.get<ApiResponse<BannerPopup[]>>("/banner-popup/admin");
    return response.data.data;
  },

  async createBanner(data: Partial<BannerPopup>): Promise<BannerPopup> {
    const response = await api.post<ApiResponse<BannerPopup>>("/banner-popup/admin", data);
    return response.data.data;
  },

  async updateBanner(id: string, data: Partial<BannerPopup>): Promise<BannerPopup> {
    const response = await api.patch<ApiResponse<BannerPopup>>(`/banner-popup/admin/${id}`, data);
    return response.data.data;
  },

  async deleteBanner(id: string): Promise<void> {
    await api.delete(`/banner-popup/admin/${id}`);
  },

  async toggleBanner(id: string): Promise<BannerPopup> {
    const response = await api.patch<ApiResponse<BannerPopup>>(`/banner-popup/admin/${id}/toggle`);
    return response.data.data;
  },

  // === EVENTS ===
  async getAllEvents(): Promise<Event[]> {
    const response = await api.get<ApiResponse<Event[]>>("/event/admin");
    return response.data.data;
  },

  async createEvent(data: Partial<Event>): Promise<Event> {
    const response = await api.post<ApiResponse<Event>>("/event/admin", data);
    return response.data.data;
  },

  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    const response = await api.patch<ApiResponse<Event>>(`/event/admin/${id}`, data);
    return response.data.data;
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/event/admin/${id}`);
  },

  async toggleEventFeatured(id: string): Promise<Event> {
    const response = await api.patch<ApiResponse<Event>>(`/event/admin/${id}/toggle-featured`);
    return response.data.data;
  },

  // === BUSINESS MODELS ===
  async getAllBusinessModels(): Promise<BusinessModel[]> {
    const response = await api.get<ApiResponse<BusinessModel[]>>("/business-model/admin");
    return response.data.data;
  },

  async createBusinessModel(data: Partial<BusinessModel>): Promise<BusinessModel> {
    const response = await api.post<ApiResponse<BusinessModel>>("/business-model/admin", data);
    return response.data.data;
  },

  async updateBusinessModel(id: string, data: Partial<BusinessModel>): Promise<BusinessModel> {
    const response = await api.patch<ApiResponse<BusinessModel>>(
      `/business-model/admin/${id}`,
      data
    );
    return response.data.data;
  },

  async deleteBusinessModel(id: string): Promise<void> {
    await api.delete(`/business-model/admin/${id}`);
  },

  async toggleBusinessModel(id: string): Promise<BusinessModel> {
    const response = await api.patch<ApiResponse<BusinessModel>>(
      `/business-model/admin/${id}/toggle`
    );
    return response.data.data;
  },

  async reorderBusinessModels(items: ReorderItem[]): Promise<void> {
    await api.patch("/business-model/admin/reorder", { items });
  },

  // === PARTNERSHIP FAQs ===
  async getAllFAQs(): Promise<PartnershipFaq[]> {
    const response = await api.get<ApiResponse<PartnershipFaq[]>>("/partnership-faq/admin");
    return response.data.data;
  },

  async createFAQ(data: Partial<PartnershipFaq>): Promise<PartnershipFaq> {
    const response = await api.post<ApiResponse<PartnershipFaq>>("/partnership-faq/admin", data);
    return response.data.data;
  },

  async updateFAQ(id: string, data: Partial<PartnershipFaq>): Promise<PartnershipFaq> {
    const response = await api.patch<ApiResponse<PartnershipFaq>>(
      `/partnership-faq/admin/${id}`,
      data
    );
    return response.data.data;
  },

  async deleteFAQ(id: string): Promise<void> {
    await api.delete(`/partnership-faq/admin/${id}`);
  },

  async toggleFAQ(id: string): Promise<PartnershipFaq> {
    const response = await api.patch<ApiResponse<PartnershipFaq>>(
      `/partnership-faq/admin/${id}/toggle`
    );
    return response.data.data;
  },

  async reorderFAQs(items: ReorderItem[]): Promise<void> {
    await api.patch("/partnership-faq/admin/reorder", { items });
  },

  // === CONFIGURATION (Settings) ===
  async getAllSettings(): Promise<Configuration[]> {
    const response = await api.get<ApiResponse<Configuration[]>>("/configuration/admin");
    return response.data.data;
  },

  async upsertSetting(data: {
    key: string;
    value: unknown;
    description?: string;
  }): Promise<Configuration> {
    const response = await api.put<ApiResponse<Configuration>>("/configuration/admin/upsert", data);
    return response.data.data;
  },

  async updateSetting(
    key: string,
    data: { value: unknown; description?: string }
  ): Promise<Configuration> {
    const response = await api.patch<ApiResponse<Configuration>>(
      `/configuration/admin/${key}`,
      data
    );
    return response.data.data;
  },

  async deleteSetting(key: string): Promise<void> {
    await api.delete(`/configuration/admin/${key}`);
  },

  // === LOGO MANAGEMENT ===
  async getPublicConfig(): Promise<Record<string, unknown>> {
    try {
      const response = await api.get<ApiResponse<Record<string, unknown>>>("/configuration/public");
      return response.data.data;
    } catch {
      return {};
    }
  },

  async updateLogo(logoData: {
    main?: string;
    light?: string;
    dark?: string;
    favicon?: string;
  }): Promise<Configuration> {
    const response = await api.put<ApiResponse<Configuration>>("/configuration/admin/upsert", {
      key: "logo",
      value: logoData,
      description: "Website logo configuration",
    });
    return response.data.data;
  },

  // === PHOTO CATEGORIES ===
  async getAllPhotoCategories(): Promise<PhotoCategory[]> {
    const response = await api.get<ApiResponse<PhotoCategory[]>>("/photo-category/admin");
    return response.data.data;
  },

  async createPhotoCategory(data: Partial<PhotoCategory>): Promise<PhotoCategory> {
    const response = await api.post<ApiResponse<PhotoCategory>>("/photo-category/admin", data);
    return response.data.data;
  },

  async updatePhotoCategory(id: string, data: Partial<PhotoCategory>): Promise<PhotoCategory> {
    const response = await api.patch<ApiResponse<PhotoCategory>>(
      `/photo-category/admin/${id}`,
      data
    );
    return response.data.data;
  },

  async deletePhotoCategory(id: string): Promise<void> {
    await api.delete(`/photo-category/admin/${id}`);
  },

  async togglePhotoCategory(id: string): Promise<PhotoCategory> {
    const response = await api.patch<ApiResponse<PhotoCategory>>(
      `/photo-category/admin/${id}/toggle`
    );
    return response.data.data;
  },

  async reorderPhotoCategories(items: ReorderItem[]): Promise<void> {
    await api.patch("/photo-category/admin/reorder", { items });
  },

  // === PHOTOS ===
  async getAllPhotos(): Promise<Photo[]> {
    const response = await api.get<ApiResponse<Photo[]>>("/photo/admin");
    return response.data.data;
  },

  async createPhoto(data: Partial<Photo>): Promise<Photo> {
    const response = await api.post<ApiResponse<Photo>>("/photo/admin", data);
    return response.data.data;
  },

  async updatePhoto(id: string, data: Partial<Photo>): Promise<Photo> {
    const response = await api.patch<ApiResponse<Photo>>(`/photo/admin/${id}`, data);
    return response.data.data;
  },

  async deletePhoto(id: string): Promise<void> {
    await api.delete(`/photo/admin/${id}`);
  },

  async togglePhoto(id: string): Promise<Photo> {
    const response = await api.patch<ApiResponse<Photo>>(`/photo/admin/${id}/toggle`);
    return response.data.data;
  },

  async reorderPhotos(items: ReorderItem[]): Promise<void> {
    await api.patch("/photo/admin/reorder", { items });
  },

  async uploadImage(file: File): Promise<{ imageUrl: string; key: string; contentType: string; size: number }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<
      ApiResponse<{ imageUrl: string; key: string; contentType: string; size: number }>
    >("/photo/admin/upload", formData);

    return response.data.data;
  },

  // === ADMIN USERS ===
  async getAllAdminUsers(): Promise<AdminUser[]> {
    const response = await api.get<ApiResponse<AdminUser[]>>("/admin-users");
    return response.data.data;
  },

  async getAdminUser(id: string): Promise<AdminUser> {
    const response = await api.get<ApiResponse<AdminUser>>(`/admin-users/${id}`);
    return response.data.data;
  },

  async createAdminUser(data: CreateAdminUserRequest): Promise<AdminUser> {
    const response = await api.post<ApiResponse<AdminUser>>("/admin-users", data);
    return response.data.data;
  },

  async updateAdminUser(id: string, data: UpdateAdminUserRequest): Promise<AdminUser> {
    const response = await api.patch<ApiResponse<AdminUser>>(`/admin-users/${id}`, data);
    return response.data.data;
  },

  async resetAdminPassword(id: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.patch<ApiResponse<{ message: string }>>(
      `/admin-users/${id}/reset-password`,
      { newPassword }
    );
    return response.data.data;
  },

  async toggleAdminUser(id: string): Promise<AdminUser> {
    const response = await api.patch<ApiResponse<AdminUser>>(`/admin-users/${id}/toggle-active`);
    return response.data.data;
  },

  async deleteAdminUser(id: string): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/admin-users/${id}`);
    return response.data.data;
  },
};

export default api;
