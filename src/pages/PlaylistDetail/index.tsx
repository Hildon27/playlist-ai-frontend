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
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlaylistTracks = useCallback(async (musics: { externalId: string }[]) => {
    setLoadingTracks(true);
    const loadedTracks: SpotifyTrack[] = [];
    
    for (const music of musics) {
      try {
        const track = await spotifyService.getTrackById(music.externalId);
        if (track) {
          loadedTracks.push(track);
        }
      } catch (err) {
        console.error(`Erro ao carregar track ${music.externalId}:`, err);
      }
    }
    
    setTracks(loadedTracks);
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
        
        if (data.musics && data.musics.length > 0) {
          loadPlaylistTracks(data.musics);
        }
      } catch (err) {
        console.error('Erro ao carregar playlist:', err);
        setError('Não foi possível carregar a playlist.');
      } finally {
        setLoading(false);
      }
    }

    loadPlaylist();
  }, [id, loadPlaylistTracks]);

  async function handleDeletePlaylist() {
    if (!playlist) return;
    
    if (!confirm(`Deseja realmente excluir a playlist "${playlist.name}"?`)) {
      return;
    }

    try {
      await playlistService.deletePlaylist(playlist.id);
      navigate('/my-playlists');
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
          <Link to="/my-playlists" className="back-btn">Voltar às playlists</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="playlist-detail-container">
      <header className="playlist-header">
        <div className="playlist-header-content">
          <div className="playlist-cover">
            {tracks[0]?.albumCover ? (
              <img src={tracks[0].albumCover} alt={playlist.name} />
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
              {tracks.length} músicas • Criada em {formatDate(playlist.createdAt)}
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
        <h2>Músicas</h2>
        
        {loadingTracks ? (
          <div className="loading-tracks">Carregando músicas...</div>
        ) : tracks.length === 0 ? (
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
            {tracks.map((track, index) => (
              <div key={track.spotifyId} className="track-item">
                <span className="track-number">{index + 1}</span>
                <div className="track-main">
                  {track.albumCover && (
                    <img 
                      src={track.albumCover} 
                      alt={track.album} 
                      className="track-cover"
                    />
                  )}
                  <div className="track-info">
                    <span className="track-name">{track.name}</span>
                    <span className="track-artist">{track.artists.join(', ')}</span>
                  </div>
                </div>
                <span className="track-album">{track.album}</span>
                <span className="track-duration">{formatDuration(track.duration)}</span>
                <div className="track-actions">
                  {track.previewUrl && (
                    <a 
                      href={track.previewUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="preview-btn"
                      title="Preview"
                    >
                      ▶
                    </a>
                  )}
                  <a 
                    href={track.spotifyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="spotify-btn"
                    title="Abrir no Spotify"
                  >
                    🎧
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link to="/my-playlists" className="back-link">← Voltar às playlists</Link>
    </div>
  );
}
