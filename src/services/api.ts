import axios from 'axios';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types/auth';
import type { 
  SpotifyTrack, 
  GeneratePlaylistRequest, 
  GeneratePlaylistResponse 
} from '../types/spotify';
import type { PlaylistsResponse, PlaylistWithMusics } from '../types/playlist';

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
    const response = await api.get('/api/spotify/search', {
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
      artist: item.artist || (Array.isArray(item.artists) ? item.artists.join(', ') : item.artists),
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
      artist: item.artist || (Array.isArray(item.artists) ? item.artists.join(', ') : item.artists),
      album: item.album,
      albumCover: item.albumCover,
      duration: item.duration,
      previewUrl: item.previewUrl || item.spotifyUrl,
    };
  },

  async getTracksByIds(trackIds: string[]): Promise<SpotifyTrack[]> {
    if (trackIds.length === 0) return [];
    try {
      const response = await api.post('/api/spotify/validate', { trackIds });
      const valid = response.data?.data?.valid || [];
      return valid.map((item: any) => ({
        id: item.id || item.spotifyId,
        name: item.name,
        artist: item.artist || (Array.isArray(item.artists) ? item.artists.join(', ') : item.artists),
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
  async generatePlaylist(data: GeneratePlaylistRequest): Promise<GeneratePlaylistResponse> {
    const response = await api.post('/api/ai/generate-playlist', data);
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
  async getMyPlaylists(page: number = 1, size: number = 10): Promise<PlaylistsResponse> {
    const response = await api.get('/api/playlists/user', {
      params: { page, size },
    });
    const resData = response.data;
    return {
      success: resData.success,
      data: resData.data || [],
      meta: resData.meta || { page, size, total: 0, totalPages: 1 },
    };
  },

  async getPlaylistById(id: string, includeMusics: boolean = false): Promise<PlaylistWithMusics> {
    const response = await api.get(`/api/playlists/${id}`, {
      params: { includeMusics },
    });
    // API wraps in { success, data: playlist }
    return response.data?.data || response.data;
  },

  async deletePlaylist(id: string): Promise<void> {
    await api.delete(`/api/playlists/${id}`);
  },
};
