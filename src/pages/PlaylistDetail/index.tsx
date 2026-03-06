import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { playlistService, spotifyService } from '../../services/api';
import type { PlaylistWithMusics } from '../../types/playlist';
import type { SpotifyTrack } from '../../types/spotify';
import './styles.css';

export function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<PlaylistWithMusics | null>(null);
  const [tracks, setTracks] = useState<Map<string, SpotifyTrack>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Pegar a primeira capa disponível (do banco ou do Spotify)
  const firstCover = playlist.musics[0]?.albumCover || 
    (tracks.size > 0 ? tracks.get(playlist.musics[0]?.externalId)?.albumCover : null);

  return (
    <div className="playlist-detail-container">
      <header className="playlist-header">
        <div className="playlist-header-content">
          <div className="playlist-cover">
            {firstCover ? (
              <img src={firstCover} alt={playlist.name} />
            ) : (
              <div className="placeholder-cover">🎵</div>
            )}
          </div>
          <div className="playlist-meta">
            <span className={`privacity-tag ${playlist.privacity.toLowerCase()}`}>
              {playlist.privacity === 'PUBLIC' || playlist.privacity === 'public' ? 'Pública' : 'Privada'}
            </span>
            <h1>{playlist.name}</h1>
            {playlist.aiMessage && (
              <p className="ai-message">{playlist.aiMessage}</p>
            )}
            <p className="playlist-info">
              {playlist.musics.length} músicas • Criada em {formatDate(playlist.createdAt)}
            </p>
          </div>
        </div>
        <div className="playlist-actions">
          <button onClick={handleDeletePlaylist} className="delete-btn">
            Excluir Playlist
          </button>
        </div>
      </header>

      <section className="tracks-section">
        <h2>Músicas {loadingTracks && <span className="loading-indicator">(carregando detalhes...)</span>}</h2>
        
        {playlist.musics.length === 0 ? (
          <div className="empty-tracks">
            <p>Esta playlist ainda não tem músicas.</p>
          </div>
        ) : (
          <div className="tracks-list">
            <div className="tracks-header">
              <span className="track-number">#</span>
              <span className="track-title-header">Título</span>
              <span className="track-album-header">Álbum</span>
              <span className="track-duration-header">⏱</span>
            </div>
            {playlist.musics.map((music, index) => {
              const trackDetails = tracks.get(music.externalId);
              const albumCover = music.albumCover || trackDetails?.albumCover;
              const trackName = trackDetails?.name;
              const trackArtist = trackDetails?.artist;
              const trackAlbum = trackDetails?.album;
              const trackDuration = trackDetails?.duration;
              const previewUrl = trackDetails?.previewUrl;
              
              return (
                <div key={music.externalId} className="track-item">
                  <span className="track-number">{index + 1}</span>
                  <div className="track-main">
                    {albumCover ? (
                      <img 
                        src={albumCover} 
                        alt={trackAlbum || ''} 
                        className="track-cover"
                      />
                    ) : (
                      <div className="track-cover-placeholder">🎵</div>
                    )}
                    <div className="track-info">
                      {trackName ? (
                        <>
                          <span className="track-name">{trackName}</span>
                          <span className="track-artist">{trackArtist}</span>
                        </>
                      ) : (
                        <>
                          <span className="track-name track-id">ID: {music.externalId}</span>
                          <a 
                            href={`https://open.spotify.com/track/${music.externalId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="track-link"
                          >
                            Ver no Spotify →
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="track-album">{trackAlbum || '-'}</span>
                  <span className="track-duration">{trackDuration ? formatDuration(trackDuration) : '-'}</span>
                  <div className="track-actions">
                    {previewUrl && (
                      <a 
                        href={previewUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="preview-btn"
                        title="Preview"
                      >
                        ▶
                      </a>
                    )}
                    <a 
                      href={`https://open.spotify.com/track/${music.externalId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="spotify-btn"
                      title="Abrir no Spotify"
                    >
                      🎧
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Link to="/" className="back-link">← Voltar</Link>
    </div>
  );
}
