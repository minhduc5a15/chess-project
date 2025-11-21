import apiClient from "../lib/axios";
import type { ChatMessage } from "../types/chat";
import { type Game, type PaginatedResult } from "../types/game";

export const gameApi = {
  // Lấy danh sách các phòng đang chờ
  getWaitingGames: async (): Promise<PaginatedResult<Game>> => {
    return gameApi.getGames("WAITING");
  },

  getGames: async (
    status: "WAITING" | "PLAYING" | "FINISHED" = "WAITING",
    page: number = 1,
    pageSize: number = 9
  ): Promise<PaginatedResult<Game>> => {
    const response = await apiClient.get(`/games`, {
      params: { status, page, pageSize },
    });
    return response.data;
  },

  getCurrentGame: async (): Promise<Game | null> => {
    try {
      const response = await apiClient.get("/games/current");
      if (response.status === 204) return null;
      return response.data;
    } catch (error) {
      return null;
    }
  },

  getMyGames: async (
    status: "ALL" | "WAITING" | "PLAYING" | "FINISHED" = "ALL",
    page: number = 1,
    pageSize: number = 9
  ): Promise<PaginatedResult<Game>> => {
    const response = await apiClient.get("/games/my-games", {
      params: { status, page, pageSize },
    });
    return response.data;
  },

  // Lấy games theo trạng thái, hỗ trợ phân trang
  getGamesByStatus: async (page = 1, pageSize = 10, status?: string | null): Promise<Game[]> => {
    const params: Record<string, any> = { page, pageSize };
    if (status) params.status = status;

    const response = await apiClient.get(`/games`, { params });
    return response.data;
  },

  // Tạo phòng mới (accepts initialMinutes and incrementSeconds)
  createGame: async (initialMinutes = 10, incrementSeconds = 0): Promise<Game> => {
    const response = await apiClient.post("/games", { initialMinutes, incrementSeconds });
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
