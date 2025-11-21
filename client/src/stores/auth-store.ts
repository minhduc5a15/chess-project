import { create } from "zustand";
import apiClient from "../lib/axios";
import type { User } from "../types/user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUserAvatar: (url: string) => void;
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
      console.log("Authenticated user:", response.data);
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  updateUserAvatar: (url: string) => {
    set((state) => ({
      user: state.user ? { ...state.user, avatarUrl: url } : null,
    }));
  },
}));
