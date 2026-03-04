import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { playlistService, spotifyService } from '../../services/api';
import type { Playlist } from '../../types/playlist';
import './styles.css';

export function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [covers, setCovers] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function loadPlaylists() {
      try {
        const response = await playlistService.getMyPlaylists(1, 20);
        const playlistsData = response.data || [];
        setPlaylists(playlistsData);

        // 1. Fetch musics for each playlist
        const playlistMusics: Record<string, string[]> = {};
        await Promise.all(
          playlistsData.map(async (playlist) => {
            try {
              const detail = await playlistService.getPlaylistById(playlist.id, true);
              playlistMusics[playlist.id] = (detail.musics || [])
                .slice(0, 4)
                .map((m) => m.externalId);
            } catch {
              playlistMusics[playlist.id] = [];
            }
          })
        );

        // 2. Collect all unique track IDs and batch fetch in ONE call
        const allIds = [...new Set(Object.values(playlistMusics).flat())];
        const tracks = await spotifyService.getTracksByIds(allIds);
        const trackMap = new Map(tracks.map((t) => [t.id, t.albumCover]));

        // 3. Map covers back to each playlist
        const coversMap: Record<string, string[]> = {};
        for (const [playlistId, musicIds] of Object.entries(playlistMusics)) {
          coversMap[playlistId] = musicIds
            .map((id) => trackMap.get(id))
            .filter((cover): cover is string => !!cover)
            .slice(0, 4);
        }
        setCovers(coversMap);
      } catch (err) {
        console.error('Erro ao carregar playlists:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPlaylists();
  }, []);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function renderCovers(playlistId: string) {
    const playlistCovers = covers[playlistId];
    if (!playlistCovers || playlistCovers.length === 0) {
      return (
        <div className="cover-mosaic placeholder-mosaic">
          <span>🎵</span>
        </div>
      );
    }

    // Fill to 4 slots: repeat covers if less than 4
    const slots = [...playlistCovers];
    while (slots.length < 4) {
      slots.push(playlistCovers[slots.length % playlistCovers.length]);
    }

    return (
      <div className="cover-mosaic">
        {slots.map((cover, i) => (
          <img key={i} src={cover} alt="" className="cover-tile" />
        ))}
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>🎵 Playlist AI</h1>
        <div className="user-info">
          <span>Olá, {user?.firstName}!</span>
          <button onClick={logout} className="logout-button">
            Sair
          </button>
        </div>
      </header>

      <main className="home-main">
        <h2 className="section-title">Minhas Playlists</h2>

        <div className="playlists-grid">
          {/* Card para criar nova playlist */}
          <div
            className="playlist-card create-card"
            onClick={() => navigate('/create-playlist')}
          >
            <div className="create-icon">＋</div>
            <h3>Criar Nova Playlist</h3>
            <p>Use IA para gerar playlists inteligentes</p>
          </div>

          {loading ? (
            <div className="playlist-card skeleton-card">
              <div className="skeleton-line wide" />
              <div className="skeleton-line medium" />
              <div className="skeleton-line short" />
            </div>
          ) : (
            playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="playlist-card"
                onClick={() => navigate(`/playlists/${playlist.id}`)}
              >
                {renderCovers(playlist.id)}
                <div className="card-header">
                  <h3>{playlist.name}</h3>
                  <span className={`privacity-badge ${playlist.privacity.toLowerCase()}`}>
                    {playlist.privacity === 'PUBLIC' ? '🌐' : '🔒'}
                  </span>
                </div>
                {playlist.aiMessage && (
                  <p className="card-description">{playlist.aiMessage}</p>
                )}
                <span className="card-date">{formatDate(playlist.createdAt)}</span>
              </div>
            ))
          )}
        </div>

        {!loading && playlists.length === 0 && (
          <p className="empty-message">
            Você ainda não tem playlists. Crie sua primeira! ✨
          </p>
        )}
      </main>
    </div>
  );
}
