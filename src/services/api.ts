import axios from 'axios';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types/auth';
import type { 
  SpotifyTrack, 
  GeneratePlaylistRequest, 
  GeneratedPlaylistResponse,
  SearchTracksResponse
} from '../types/spotify';
import type { Playlist, PlaylistWithMusics, PlaylistsResponse } from '../types/playlist';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/api/users/me');
    return response.data;
  },
};

export const spotifyService = {
  async searchTracks(query: string, limit: number = 10): Promise<SpotifyTrack[]> {
    const response = await api.get<SearchTracksResponse>('/api/spotify/search', {
      params: { query, limit },
    });
    // API retorna { success, data, count }
    return response.data.data || [];
  },

  async getTrackById(trackId: string): Promise<SpotifyTrack | null> {
    const response = await api.get(`/api/spotify/tracks/${trackId}`);
    return response.data.data || null;
  },
};

export const aiService = {
  async generatePlaylist(data: GeneratePlaylistRequest): Promise<GeneratedPlaylistResponse> {
    const response = await api.post<GeneratedPlaylistResponse>('/api/ai/generate-playlist', data);
    return response.data;
  },
};

export const playlistService = {
  async getMyPlaylists(page: number = 1, size: number = 10): Promise<PlaylistsResponse> {
    const response = await api.get<PlaylistsResponse>('/api/playlists/user', {
      params: { page, size },
    });
    return response.data;
  },

  async getPlaylistById(id: string, includeMusics: boolean = false): Promise<Playlist | PlaylistWithMusics> {
    const response = await api.get(`/api/playlists/${id}`, {
      params: { includeMusics },
    });
    return response.data.data;
  },

  async deletePlaylist(id: string): Promise<void> {
    await api.delete(`/api/playlists/${id}`);
  },
};
