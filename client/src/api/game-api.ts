import apiClient from "../lib/axios";
import type { ChatMessage } from "../types/chat";
import { type Game } from "../types/game";

export const gameApi = {
  // Lấy danh sách các phòng đang chờ
  getWaitingGames: async (): Promise<Game[]> => {
    const response = await apiClient.get("/games/waiting");
    return response.data;
  },

  // Lấy games theo trạng thái, hỗ trợ phân trang
  getGamesByStatus: async (page = 1, pageSize = 10, status?: string | null): Promise<Game[]> => {
    const params: Record<string, any> = { page, pageSize };
    if (status) params.status = status;

    const response = await apiClient.get(`/games`, { params });
    return response.data;
  },

  // Tạo phòng mới
  createGame: async (): Promise<Game> => {
    const response = await apiClient.post("/games");
    return response.data;
  },

  // Tham gia vào một phòng
  joinGame: async (gameId: string): Promise<void> => {
    await apiClient.put(`/games/${gameId}/join`);
  },

  // Lấy thông tin chi tiết một phòng
  getGame: async (gameId: string): Promise<Game> => {
    const response = await apiClient.get(`/games/${gameId}`);
    return response.data;
  },

  getMessages: async (gameId: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/games/${gameId}/messages`);
    return response.data;
  },
  // Lấy phòng chờ do mình tạo
  getMyWaitingGame: async (): Promise<Game | null> => {
    try {
      const response = await apiClient.get("/games/my-waiting-room");
      return response.data;
    } catch (error: any) {
      if (error?.response && error.response.status === 404) return null;
      throw error;
    }
  },

  // Hủy phòng
  cancelGame: async (gameId: string): Promise<void> => {
    await apiClient.delete(`/games/${gameId}`);
  },
};
