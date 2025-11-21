import apiClient from "../lib/axios";
import type { ChatMessage } from "../types/chat";
import { type Game } from "../types/game";

export const gameApi = {
  // Lấy danh sách các phòng đang chờ
  getWaitingGames: async (): Promise<Game[]> => {
    const response = await apiClient.get("/games/waiting");
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
};
