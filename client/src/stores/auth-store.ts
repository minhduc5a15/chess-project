import { create } from "zustand";
import apiClient from "../lib/axios";

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (username, password) => {
    await apiClient.post("/auth/login", { username, password });
    await useAuthStore.getState().checkAuth();
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get("/auth/me");
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
