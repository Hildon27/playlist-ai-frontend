import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IoGlobe, IoLockClosed } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { playlistService } from '../../services/api';
import type { Playlist } from '../../types/playlist';
import './styles.css';

export function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadPlaylists() {
      try {
        const response = await playlistService.getMyPlaylists(1, 20);
        setPlaylists(response.data || []);
      } catch (err) {
        console.error('Erro ao carregar playlists:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPlaylists();
  }, []);

  function scrollCarousel(direction: 'left' | 'right') {
    if (!carouselRef.current) return;
    const scrollAmount = 300;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function renderCovers(playlist: Playlist) {
    const playlistCovers = playlist.coverImages;
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
        <h1>Playlist AI</h1>
        <div className="user-info">
          <span className="user-name">Olá, {user?.firstName}</span>
          <Link to="/profile" className="profile-link">
            Meu Perfil
          </Link>
          <button onClick={logout} className="logout-button">
            Sair
          </button>
        </div>
      </header>

      <main className="home-main">
        <div className="section-header">
          <h2 className="section-title">Minhas Playlists</h2>
          <div className="carousel-controls">
            <button 
              className="carousel-btn" 
              onClick={() => scrollCarousel('left')}
              aria-label="Anterior"
            >
              ‹
            </button>
            <button 
              className="carousel-btn" 
              onClick={() => scrollCarousel('right')}
              aria-label="Próximo"
            >
              ›
            </button>
          </div>
        </div>

        <div className="carousel-container">
          <div className="playlists-carousel" ref={carouselRef}>
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
              <>
                <div className="playlist-card skeleton-card">
                  <div className="skeleton-cover" />
                  <div className="skeleton-line wide" />
                  <div className="skeleton-line medium" />
                </div>
                <div className="playlist-card skeleton-card">
                  <div className="skeleton-cover" />
                  <div className="skeleton-line wide" />
                  <div className="skeleton-line medium" />
                </div>
              </>
            ) : (
              playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="playlist-card"
                  onClick={() => navigate(`/playlists/${playlist.id}`)}
                >
                  {renderCovers(playlist)}
                  <div className="card-header">
                    <h3>{playlist.name}</h3>
                    <span className={`privacity-badge ${playlist.privacity.toLowerCase()}`}>
                      {playlist.privacity.toUpperCase() === 'PUBLIC' ? <IoGlobe size={16} /> : <IoLockClosed size={16} />}
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
