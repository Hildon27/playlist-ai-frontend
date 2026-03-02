// TrackDTO do backend
export interface SpotifyTrack {
  spotifyId: string;
  name: string;
  artists: string[];
  album: string;
  albumCover: string | null;
  duration: number;
  previewUrl: string | null;
  spotifyUrl: string;
}

// Resposta da busca do Spotify
export interface SearchTracksResponse {
  success: boolean;
  data: SpotifyTrack[];
  count: number;
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
  privacity?: 'public' | 'private';
}

// Resposta da geração de playlist
export interface GeneratedPlaylistResponse {
  success: boolean;
  data: {
    playlist: {
      id: string;
      name: string;
      privacity: string;
      aiMessage: string;
    };
    tracksAdded: number;
    tracksFailed: number;
    aiGeneration: {
      message: string;
      seedTracks: SeedTrack[];
      generatedTracks: SpotifyTrack[];
      invalidSuggestions: { name: string; artist: string }[];
      stats: {
        requested: number;
        found: number;
        notFound: number;
      };
    };
  };
}
