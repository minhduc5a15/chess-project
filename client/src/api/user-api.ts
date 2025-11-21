import apiClient from "../lib/axios";
import { type User } from "../types/user";

export const userApi = {
  // Admin: Lấy danh sách user
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get("/users");
    return response.data;
  },

  // Admin: Xóa user
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },

  // User: Upload Avatar
  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.avatarUrl;
  },

  getUserProfile: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  getByUsername: async (username: string): Promise<{ id: string; username: string } | null> => {
    try {
      const response = await apiClient.get(`/users/by-username/${encodeURIComponent(username)}`);
      return response.data;
    } catch (err: any) {
      if (err?.response && err.response.status === 404) return null;
      throw err;
    }
  },

  updateProfile: async (bio: string): Promise<void> => {
    await apiClient.put("/users/profile", { bio });
  },
};
