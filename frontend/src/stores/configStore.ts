import { create } from "zustand";
import { configurationApi } from "@/api";
import { appLogger } from "@/lib/logger";

interface GlobalConfig {
  primary_register_url?: {
    url: string;
  };
  site_name?: {
    name: string;
    shortName: string;
    tagline: string;
  };
  contact_info?: {
    hotline: string;
    email: string;
    address: string;
  };
  social_links?: {
    facebook: string;
    zalo: string;
    youtube: string;
  };
  logo?: {
    main: string;
    light: string;
    dark: string;
    favicon: string;
  };
}

interface ConfigStore {
  config: GlobalConfig;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  fetchConfig: () => Promise<void>;
  getRegisterUrl: () => string;
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  config: {},
  isLoaded: false,
  isLoading: false,
  error: null,

  fetchConfig: async () => {
    const state = get();
    
    // Avoid redundant fetching
    if (state.isLoading || state.isLoaded) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const config = await configurationApi.getAll();
      set({
        config: config as GlobalConfig,
        isLoaded: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      appLogger.error("config-store", "Failed to fetch configuration", { error });
      set({
        config: {},
        isLoaded: false,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load config",
      });
    }
  },

  getRegisterUrl: () => {
    const state = get();
    return state.config.primary_register_url?.url || "https://bizmall.vn";
  },
}));

// Hook để sử dụng trong components
export function useRegisterUrl() {
  const { config, isLoaded, fetchConfig, getRegisterUrl } = useConfigStore();

  // Auto-fetch on first use
  if (!isLoaded) {
    fetchConfig();
  }

  return {
    url: getRegisterUrl(),
    isLoaded,
    config,
  };
}
