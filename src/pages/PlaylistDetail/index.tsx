import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { playlistService, spotifyService } from '../../services/api';
import type { PlaylistWithMusics } from '../../types/playlist';
import type { SpotifyTrack } from '../../types/spotify';
import { PlaylistDetailCover, TrackSkeleton, TrackItem, BackLink } from '../../components';
import { formatDateLong } from '../../utils/date';
import './styles.css';

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
      trackDetails.forEach((track) => {
        trackMap.set(track.id, track);
      });
      setTracks(trackMap);
    } catch (err) {
      console.error('Erro ao carregar detalhes das músicas (Spotify pode estar indisponível):', err);
    }
    setLoadingTracks(false);
  }, []);

  useEffect(() => {
    async function loadPlaylist() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = (await playlistService.getPlaylistById(id, true)) as PlaylistWithMusics;
        setPlaylist(data);

        if (data.musics && data.musics.length > 0) {
          const externalIds = data.musics.map((m) => m.externalId);
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

  function getTotalDuration() {
    let total = 0;
    tracks.forEach((track) => {
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
          <Link to="/" className="back-btn">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const coverImages = playlist.musics
    .slice(0, 4)
    .map((m) => m.albumCover || tracks.get(m.externalId)?.albumCover)
    .filter((c): c is string => !!c);

  return (
    <div className="playlist-detail-container">
      <audio id="preview-audio" onEnded={() => setPlayingPreview(null)} />

      <header className="playlist-header">
        <div className="playlist-header-content">
          <div className="playlist-cover">
            <PlaylistDetailCover coverImages={coverImages} playlistName={playlist.name} />
          </div>
          <div className="playlist-meta">
            <span className="playlist-type">Playlist</span>
            <h1>{playlist.name}</h1>
            {playlist.aiMessage && (
              <p className="ai-message">&quot;{playlist.aiMessage}&quot;</p>
            )}
            <div className="playlist-stats">
              <span className={`privacity-tag ${playlist.privacity.toLowerCase()}`}>
                {playlist.privacity === 'PUBLIC' || playlist.privacity === 'public'
                  ? '🌐 Pública'
                  : '🔒 Privada'}
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
              <span>Criada em {formatDateLong(playlist.createdAt)}</span>
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
              Array.from({ length: Math.min(playlist.musics.length, 5) }).map((_, i) => (
                <TrackSkeleton key={`skeleton-${i}`} />
              ))
            ) : (
              playlist.musics.map((music, index) => (
                <TrackItem
                  key={music.externalId}
                  music={music}
                  trackDetails={tracks.get(music.externalId)}
                  index={index}
                  isPlaying={playingPreview === music.externalId}
                  onPreviewPlay={handlePreviewPlay}
                />
              ))
            )}
          </div>
        )}
      </section>

      <BackLink to="/" className="back-link" />
    </div>
  );
}
