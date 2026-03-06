import type { Privacity } from './auth';

export interface Playlist {
  id: string;
  name: string;
  privacity: Privacity;
  aiMessage: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  coverImages?: string[];
}

export interface PlaylistMusic {
  id: string;
  externalId: string;
  albumCover?: string | null;
  createdAt: string;
}

export interface PlaylistWithMusics extends Playlist {
  musics: PlaylistMusic[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface PlaylistsResponse extends PaginatedResponse<Playlist> {}
