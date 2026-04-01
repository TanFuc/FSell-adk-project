import axios from "axios";
import type { Section, BannerPopup, Event, BusinessModel, PartnershipFaq } from "@/types";
import { appLogger } from "@/lib/logger";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  appLogger.info("public-api", "Request", {
    method: config.method,
    url: `${config.baseURL || ""}${config.url || ""}`,
    params: config.params,
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    appLogger.info("public-api", "Response", {
      method: response.config.method,
      url: `${response.config.baseURL || ""}${response.config.url || ""}`,
      status: response.status,
    });
    return response;
  },
  (error) => {
    appLogger.error("public-api", "Response error", {
      method: error?.config?.method,
      url: error?.config?.url,
      status: error?.response?.status,
      message: error?.message,
    });
    return Promise.reject(error);
  }
);

// Page Sections API
export const sectionApi = {
  getAll: async (): Promise<Section[]> => {
    const { data } = await api.get("/section/public");
    return data.data || data;
  },

  getByKey: async (key: string): Promise<Section | null> => {
    const { data } = await api.get(`/section/public/key/${key}`);
    return data.data || data;
  },

  getByLayoutType: async (layoutType: string): Promise<Section[]> => {
    const { data } = await api.get(`/section/public/layout/${layoutType}`);
    return data.data || data;
  },
};

// Banner Popup API
export const bannerPopupApi = {
  getActive: async (): Promise<BannerPopup | null> => {
    const { data } = await api.get("/banner-popup/public/active");
    return data.data || data;
  },

  getAllActive: async (): Promise<BannerPopup[]> => {
    const { data } = await api.get("/banner-popup/public/all-active");
    return data.data || data;
  },
};

// Events API
export const eventApi = {
  getAll: async (): Promise<Event[]> => {
    const { data } = await api.get("/event/public");
    return data.data || data;
  },

  getFeatured: async (): Promise<Event[]> => {
    const { data } = await api.get("/event/public/featured");
    return data.data || data;
  },

  getUpcoming: async (): Promise<Event[]> => {
    const { data } = await api.get("/event/public/upcoming");
    return data.data || data;
  },

  getById: async (id: string): Promise<Event> => {
    const { data } = await api.get(`/event/public/${id}`);
    return data.data || data;
  },
};

// Global Settings API
export const configurationApi = {
  getAll: async (): Promise<Record<string, unknown>> => {
    try {
      const { data } = await api.get("/configuration/public");
      return data.data || data;
    } catch {
      return {};
    }
  },
};

// Business Models API
export const businessModelApi = {
  getAll: async (): Promise<BusinessModel[]> => {
    const { data } = await api.get("/business-model/public");
    return data.data || data;
  },

  getById: async (id: string): Promise<BusinessModel> => {
    const { data } = await api.get(`/business-model/public/${id}`);
    return data.data || data;
  },
};

// Partnership FAQs API
export const partnershipFaqApi = {
  getAll: async (): Promise<PartnershipFaq[]> => {
    const { data } = await api.get("/partnership-faq/public");
    return data.data || data;
  },
};

// Click Tracking API
export interface TrackClickData {
  buttonName: string;
  pageUrl?: string;
  redirectUrl?: string;
  referrer?: string;
}

export const clickTrackingApi = {
  trackClick: async (data: TrackClickData): Promise<{ success: boolean }> => {
    try {
      const { data: response } = await api.post("/click-tracking", {
        buttonName: data.buttonName,
        pageUrl: data.pageUrl || window.location.href,
        redirectUrl: data.redirectUrl,
        referrer: data.referrer || document.referrer,
      });
      return response;
    } catch (error) {
      // Don't throw error - tracking should not break user experience
      appLogger.warn("click-tracking", "Failed to track click", { error });
      return { success: false };
    }
  },
};

export default api;
