import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { playlistService, spotifyService } from '../../services/api';
import type { PlaylistWithMusics } from '../../types/playlist';
import type { SpotifyTrack } from '../../types/spotify';
import './styles.css';

function TrackSkeleton() {
  return (
    <div className="track-item track-skeleton">
      <span className="track-number skeleton-pulse"></span>
      <div className="track-main">
        <div className="track-cover-placeholder skeleton-pulse"></div>
        <div className="track-info">
          <span className="track-name skeleton-pulse skeleton-text"></span>
          <span className="track-artist skeleton-pulse skeleton-text-small"></span>
        </div>
      </div>
      <span className="track-album skeleton-pulse skeleton-text"></span>
      <span className="track-duration skeleton-pulse skeleton-text-small"></span>
      <div className="track-actions"></div>
    </div>
  );
}

export function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<PlaylistWithMusics | null>(null);
  const [tracks, setTracks] = useState<Map<string, SpotifyTrack>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  const loadTrackDetails = useCallback(async (externalIds: string[]) => {
    if (externalIds.length === 0) return;
    
    setLoadingTracks(true);
    try {
      const trackDetails = await spotifyService.getTracksByIds(externalIds);
      const trackMap = new Map<string, SpotifyTrack>();
      trackDetails.forEach(track => {
        trackMap.set(track.id, track);
      });
      setTracks(trackMap);
    } catch (err) {
      console.error('Erro ao carregar detalhes das músicas (Spotify pode estar indisponível):', err);
      // Não mostra erro - apenas não teremos os detalhes
    }
    setLoadingTracks(false);
  }, []);

  useEffect(() => {
    async function loadPlaylist() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await playlistService.getPlaylistById(id, true) as PlaylistWithMusics;
        setPlaylist(data);
        
        // Buscar detalhes das músicas via batch
        if (data.musics && data.musics.length > 0) {
          const externalIds = data.musics.map(m => m.externalId);
          loadTrackDetails(externalIds);
        }
      } catch (err) {
        console.error('Erro ao carregar playlist:', err);
        setError('Não foi possível carregar a playlist.');
      } finally {
        setLoading(false);
      }
    }

    loadPlaylist();
  }, [id, loadTrackDetails]);

  async function handleDeletePlaylist() {
    if (!playlist) return;
    
    if (!confirm(`Deseja realmente excluir a playlist "${playlist.name}"?`)) {
      return;
    }

    try {
      await playlistService.deletePlaylist(playlist.id);
      navigate('/');
    } catch (err) {
      console.error('Erro ao excluir playlist:', err);
      alert('Não foi possível excluir a playlist.');
    }
  }

  function formatDuration(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  function getTotalDuration() {
    let total = 0;
    tracks.forEach(track => {
      if (track.duration) total += track.duration;
    });
    const hours = Math.floor(total / 3600000);
    const minutes = Math.floor((total % 3600000) / 60000);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  }

  function handlePreviewPlay(previewUrl: string, trackId: string) {
    if (playingPreview === trackId) {
      setPlayingPreview(null);
      const audio = document.getElementById('preview-audio') as HTMLAudioElement;
      if (audio) audio.pause();
    } else {
      setPlayingPreview(trackId);
      const audio = document.getElementById('preview-audio') as HTMLAudioElement;
      if (audio) {
        audio.src = previewUrl;
        audio.play();
      }
    }
  }

  if (loading) {
    return (
      <div className="playlist-detail-container">
        <div className="loading">Carregando playlist...</div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="playlist-detail-container">
        <div className="error-state">
          <p>{error || 'Playlist não encontrada.'}</p>
          <Link to="/" className="back-btn">Voltar</Link>
        </div>
      </div>
    );
  }

  // Pegar até 4 capas para o mosaico de capa
  const coverImages = playlist.musics
    .slice(0, 4)
    .map(m => m.albumCover || tracks.get(m.externalId)?.albumCover)
    .filter((c): c is string => !!c);

  return (
    <div className="playlist-detail-container">
      <audio id="preview-audio" onEnded={() => setPlayingPreview(null)} />
      
      <header className="playlist-header">
        <div className="playlist-header-content">
          <div className="playlist-cover">
            {coverImages.length >= 4 ? (
              <div className="cover-mosaic">
                {coverImages.slice(0, 4).map((cover, i) => (
                  <img key={i} src={cover} alt="" className="mosaic-img" />
                ))}
              </div>
            ) : coverImages.length > 0 ? (
              <img src={coverImages[0]} alt={playlist.name} />
            ) : (
              <div className="placeholder-cover">🎵</div>
            )}
          </div>
          <div className="playlist-meta">
            <span className="playlist-type">Playlist</span>
            <h1>{playlist.name}</h1>
            {playlist.aiMessage && (
              <p className="ai-message">"{playlist.aiMessage}"</p>
            )}
            <div className="playlist-stats">
              <span className={`privacity-tag ${playlist.privacity.toLowerCase()}`}>
                {playlist.privacity === 'PUBLIC' || playlist.privacity === 'public' ? '🌐 Pública' : '🔒 Privada'}
              </span>
              <span className="stat-divider">•</span>
              <span>{playlist.musics.length} músicas</span>
              {tracks.size > 0 && (
                <>
                  <span className="stat-divider">•</span>
                  <span>{getTotalDuration()}</span>
                </>
              )}
              <span className="stat-divider">•</span>
              <span>Criada em {formatDate(playlist.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="playlist-actions">
          <button onClick={handleDeletePlaylist} className="delete-btn">
            🗑️ Excluir
          </button>
        </div>
      </header>

      <section className="tracks-section">
        {playlist.musics.length === 0 ? (
          <div className="empty-tracks">
            <div className="empty-icon">🎵</div>
            <h3>Playlist vazia</h3>
            <p>Esta playlist ainda não tem músicas.</p>
          </div>
        ) : (
          <div className="tracks-list">
            <div className="tracks-header">
              <span className="track-number">#</span>
              <span className="track-title-header">Título</span>
              <span className="track-album-header">Álbum</span>
              <span className="track-duration-header">⏱</span>
              <span className="track-actions-header"></span>
            </div>
            {loadingTracks && tracks.size === 0 ? (
              // Skeleton loading state
              Array.from({ length: Math.min(playlist.musics.length, 5) }).map((_, i) => (
                <TrackSkeleton key={`skeleton-${i}`} />
              ))
            ) : (
              playlist.musics.map((music, index) => {
                const trackDetails = tracks.get(music.externalId);
                const albumCover = music.albumCover || trackDetails?.albumCover;
                const trackName = trackDetails?.name;
                const trackArtist = trackDetails?.artist;
                const trackAlbum = trackDetails?.album;
                const trackDuration = trackDetails?.duration;
                const previewUrl = trackDetails?.previewUrl;
                const isPlaying = playingPreview === music.externalId;
                
                return (
                  <div 
                    key={music.externalId} 
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
                            onClick={() => handlePreviewPlay(previewUrl, music.externalId)}
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
              })
            )}
          </div>
        )}
      </section>

      <Link to="/" className="back-link">← Voltar</Link>
    </div>
  );
}
