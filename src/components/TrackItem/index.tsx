import { formatDuration } from '../../utils/date';
import type { PlaylistMusic } from '../../types/playlist';
import type { SpotifyTrack } from '../../types/spotify';

type TrackItemProps = {
  music: PlaylistMusic;
  trackDetails: SpotifyTrack | undefined;
  index: number;
  isPlaying: boolean;
  onPreviewPlay: (previewUrl: string, trackId: string) => void;
};

export function TrackItem({
  music,
  trackDetails,
  index,
  isPlaying,
  onPreviewPlay,
}: TrackItemProps) {
  const albumCover = music.albumCover || trackDetails?.albumCover;
  const trackName = trackDetails?.name;
  const trackArtist = trackDetails?.artist;
  const trackAlbum = trackDetails?.album;
  const trackDuration = trackDetails?.duration;
  const previewUrl = trackDetails?.previewUrl;

  return (
    <div
      className={`track-item ${isPlaying ? 'playing' : ''} ${!trackName ? 'loading-details' : ''}`}
    >
      <span className="track-number">
        {isPlaying ? (
          <span className="playing-indicator">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </span>
        ) : (
          index + 1
        )}
      </span>
      <div className="track-main">
        <div className="track-cover-wrapper">
          {albumCover ? (
            <img
              src={albumCover}
              alt={trackAlbum || ''}
              className="track-cover"
            />
          ) : (
            <div className="track-cover-placeholder">🎵</div>
          )}
          {previewUrl && (
            <button
              className="play-overlay"
              onClick={() => onPreviewPlay(previewUrl, music.externalId)}
              title={isPlaying ? 'Pausar preview' : 'Ouvir preview'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
          )}
        </div>
        <div className="track-info">
          {trackName ? (
            <>
              <span className="track-name" title={trackName}>{trackName}</span>
              <span className="track-artist" title={trackArtist}>
                <a
                  href={`https://open.spotify.com/search/${encodeURIComponent(trackArtist || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="artist-link"
                >
                  {trackArtist}
                </a>
              </span>
            </>
          ) : (
            <>
              <span className="track-name track-loading">Carregando...</span>
              <span className="track-artist track-id">{music.externalId.slice(0, 12)}...</span>
            </>
          )}
        </div>
      </div>
      <span className="track-album" title={trackAlbum || ''}>
        {trackAlbum ? (
          <a
            href={`https://open.spotify.com/search/${encodeURIComponent(trackAlbum)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="album-link"
          >
            {trackAlbum}
          </a>
        ) : (
          <span className="album-loading">—</span>
        )}
      </span>
      <span className="track-duration">
        {trackDuration ? formatDuration(trackDuration) : '—'}
      </span>
      <div className="track-actions">
        <a
          href={`https://open.spotify.com/track/${music.externalId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="spotify-btn"
          title="Abrir no Spotify"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
