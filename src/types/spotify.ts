export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumCover?: string;
  duration?: number;
  previewUrl?: string;
}

export interface SearchTracksResponse {
  tracks: SpotifyTrack[];
}

export interface SeedTrack {
  name: string;
  artist: string;
  spotifyId?: string;
}

export interface GeneratePlaylistRequest {
  name: string;
  seedTracks: SeedTrack[];
  limit?: number;
  privacity?: "public" | "private";
}

export interface GeneratedTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumCover?: string;
}

export interface GeneratePlaylistResponse {
  tracks: GeneratedTrack[];
}
