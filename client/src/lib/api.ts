/**
 * Unified API layer.
 * On web: delegates to Express REST API via fetch.
 * On native (Electron / Capacitor): uses nativeApi (localStorage).
 */
import { apiRequest } from "./queryClient";
import { isNative, nativeApi } from "./storage";

export const api = {
  async createPlayer(data: { name: string; avatar: string }) {
    if (isNative()) return nativeApi.createPlayer(data);
    return apiRequest("POST", "/api/players", data);
  },

  async getPlayer(id: number) {
    if (isNative()) return nativeApi.getPlayer(id);
    return apiRequest("GET", `/api/players/${id}`);
  },

  async updatePlayer(id: number, data: any) {
    if (isNative()) return nativeApi.updatePlayer(id, data);
    return apiRequest("PATCH", `/api/players/${id}`, data);
  },

  async getAllPlayers() {
    if (isNative()) return nativeApi.getAllPlayers();
    return apiRequest("GET", "/api/players");
  },

  async saveProgress(data: any) {
    if (isNative()) return nativeApi.upsertProgress(data);
    return apiRequest("POST", "/api/progress", data);
  },

  async getProgress(playerId: number) {
    if (isNative()) return nativeApi.getProgress(playerId);
    return apiRequest("GET", `/api/progress/${playerId}`);
  },
};
