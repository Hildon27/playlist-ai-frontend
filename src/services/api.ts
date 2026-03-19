import axios from "axios";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from "../types/auth";
import type {
  SpotifyTrack,
  GeneratePlaylistRequest,
  GeneratePlaylistResponse,
} from "../types/spotify";
import type { PlaylistsResponse, PlaylistWithMusics } from "../types/playlist";
import type { FollowRequestProcessingAction } from "../types/follow";
import type {
  PlaylistCommentWithUser,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentsPaginatedResponse,
} from "../types/comment";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token em requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  privacity?: "public" | "private";
}

export const authService = {
  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post<User>("/auth/register", data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>(
      "/api/users/me",
    );
    return response.data.data;
  },
};

export const userService = {
  async getProfile(): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>(
      "/api/users/me",
    );
    return response.data.data;
  },

  async updateProfile(data: UpdateUserRequest): Promise<User> {
    const response = await api.put<{ success: boolean; data: User }>(
      "/api/users/me",
      data,
    );
    return response.data.data;
  },

  async deleteAccount(): Promise<void> {
    await api.delete("/api/users/me");
  },

  async getAll(page = 1, size = 20) {
    const response = await api.get("/api/users", {
      params: { page, size },
    });

    return response.data;
  },

  async getFollowers() {
    const response = await api.get("/api/follows/followers");
    return response.data;
  },

  async getFolloweds() {
    const response = await api.get("/api/follows/followeds");
    return response.data;
  },

  async requestFollow(userEmail: string) {
    const response = await api.post("/api/follow-requests/register", {
      followedUserEmail: userEmail,
    });
    return response.data.data;
  },

  async cancelFollowRequest(requestId: string) {
    await api.delete(`/api/follow-requests/${requestId}`);
    return true;
  },

  async unfollow(userId: string) {
    await api.delete(`/api/follows/${userId}/unfollow`);
    return true;
  },

  async removeFollower(userId: string) {
    await api.delete(`/api/follows/${userId}/remove`);
    return true;
  },

  async getSentFollowRequests() {
    const response = await api.get("/api/follow-requests/sent");
    return response.data.data;
  },

  async getReceivedFollowRequests() {
    const response = await api.get("/api/follow-requests/received");
    return response.data.data;
  },

  async processFollowRequest(
    id: string,
    action: FollowRequestProcessingAction,
  ) {
    const response = await api.patch(`/api/follow-requests/${id}/process`, {
      action,
    });
    return response.data.data;
  },
};

export const spotifyService = {
  async searchTracks(
    query: string,
    limit: number = 10,
  ): Promise<SpotifyTrack[]> {
    const response = await api.get("/api/spotify/search", {
      params: { query, limit },
    });
    const data = response.data;
    let raw: any[] = [];
    if (Array.isArray(data)) {
      raw = data;
    } else if (data?.data && Array.isArray(data.data)) {
      raw = data.data;
    } else if (data?.tracks && Array.isArray(data.tracks)) {
      raw = data.tracks;
    } else if (data?.items && Array.isArray(data.items)) {
      raw = data.items;
    }
    // Map API fields to SpotifyTrack interface
    return raw.map((item: any) => ({
      id: item.id || item.spotifyId,
      name: item.name,
      artist:
        item.artist ||
        (Array.isArray(item.artists) ? item.artists.join(", ") : item.artists),
      album: item.album,
      albumCover: item.albumCover,
      duration: item.duration,
      previewUrl: item.previewUrl || item.spotifyUrl,
    }));
  },

  async getTrackById(trackId: string): Promise<SpotifyTrack> {
    const response = await api.get(`/api/spotify/tracks/${trackId}`);
    // API may wrap in { success, data: track }
    const item = response.data?.data || response.data;
    return {
      id: item.id || item.spotifyId,
      name: item.name,
      artist:
        item.artist ||
        (Array.isArray(item.artists) ? item.artists.join(", ") : item.artists),
      album: item.album,
      albumCover: item.albumCover,
      duration: item.duration,
      previewUrl: item.previewUrl || item.spotifyUrl,
    };
  },

  async getTracksByIds(trackIds: string[]): Promise<SpotifyTrack[]> {
    if (trackIds.length === 0) return [];
    try {
      const response = await api.post("/api/spotify/validate", { trackIds });
      const valid = response.data?.data?.valid || [];
      return valid.map((item: any) => ({
        id: item.id || item.spotifyId,
        name: item.name,
        artist:
          item.artist ||
          (Array.isArray(item.artists)
            ? item.artists.join(", ")
            : item.artists),
        album: item.album,
        albumCover: item.albumCover,
        duration: item.duration,
        previewUrl: item.previewUrl || item.spotifyUrl,
      }));
    } catch {
      return [];
    }
  },
};

export const aiService = {
  async generatePlaylist(
    data: GeneratePlaylistRequest,
  ): Promise<GeneratePlaylistResponse> {
    const response = await api.post("/api/ai/generate-playlist", data);
    const resData = response.data;

    // API returns { data: { generatedTracks: [...] } }
    if (resData?.data?.generatedTracks) {
      return { tracks: resData.data.generatedTracks };
    }
    if (resData?.generatedTracks) {
      return { tracks: resData.generatedTracks };
    }
    if (Array.isArray(resData)) {
      return { tracks: resData };
    }
    if (resData?.tracks) {
      return resData;
    }
    return { tracks: [] };
  },
};

export const playlistService = {
  async getMyPlaylists(
    page: number = 1,
    size: number = 10,
  ): Promise<PlaylistsResponse> {
    const response = await api.get("/api/playlists/user", {
      params: { page, size },
    });
    const resData = response.data;
    return {
      success: resData.success,
      data: resData.data || [],
      meta: resData.meta || { page, size, total: 0, totalPages: 1 },
    };
  },

  async getPlaylistById(
    id: string,
    includeMusics: boolean = false,
  ): Promise<PlaylistWithMusics> {
    const response = await api.get(`/api/playlists/${id}`, {
      params: { includeMusics },
    });
    // API wraps in { success, data: playlist }
    return response.data?.data || response.data;
  },

  async deletePlaylist(id: string): Promise<void> {
    await api.delete(`/api/playlists/${id}`);
  },

  async getPublicPlaylists(
    page: number = 1,
    size: number = 20,
  ): Promise<PlaylistsResponse> {
    const response = await api.get("/api/playlists/public/all", {
      params: { page, size },
    });

    const resData = response.data;

    return {
      success: resData.success,
      data: resData.data || [],
      meta: resData.meta || { page, size, total: 0, totalPages: 1 },
    };
  },
};

export type CommentListParams = {
  page?: number;
  size?: number;
  sortBy?: "createdAt" | "updatedAt" | "content";
  sortOrder?: "asc" | "desc";
};

export const commentService = {
  async getByPlaylistId(
    playlistId: string,
    params: CommentListParams = {},
  ): Promise<CommentsPaginatedResponse> {
    const {
      page = 1,
      size = 10,
      sortBy = "createdAt",
      sortOrder = "asc",
    } = params;
    const response = await api.get(`/api/comments/playlist/${playlistId}`, {
      params: { page, size, sortBy, sortOrder },
    });
    const res = response.data;
    return {
      data: res.data ?? [],
      meta: res.meta ?? { page, size, total: 0, totalPages: 1 },
    };
  },

  async create(
    playlistId: string,
    data: CreateCommentRequest,
  ): Promise<PlaylistCommentWithUser> {
    const response = await api.post(`/api/comments/${playlistId}`, data);
    return response.data?.data ?? response.data;
  },

  async update(
    commentId: string,
    data: UpdateCommentRequest,
  ): Promise<PlaylistCommentWithUser> {
    const response = await api.put(`/api/comments/${commentId}`, data);
    return response.data?.data ?? response.data;
  },

  async delete(commentId: string): Promise<void> {
    await api.delete(`/api/comments/${commentId}`);
  },
};
