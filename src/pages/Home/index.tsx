import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { playlistService } from '../../services/api';
import type { Playlist } from '../../types/playlist';
import {
  HomeHeader,
  SectionHeader,
  CarouselControls,
  CreatePlaylistCard,
  PlaylistCard,
  PlaylistCardSkeleton,
} from '../../components';
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

  return (
    <div className="home-container">
      <HomeHeader userName={user?.firstName ?? ''} onLogout={logout} />

      <main className="home-main">
        <SectionHeader
          title="Minhas Playlists"
        >
          <CarouselControls
            onLeft={() => scrollCarousel('left')}
            onRight={() => scrollCarousel('right')}
          />
        </SectionHeader>

        <div className="carousel-container">
          <div className="playlists-carousel" ref={carouselRef}>
            <CreatePlaylistCard onClick={() => navigate('/create-playlist')} />

            {loading ? (
              <>
                <PlaylistCardSkeleton />
                <PlaylistCardSkeleton />
              </>
            ) : (
              playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onClick={() => navigate(`/playlists/${playlist.id}`)}
                />
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
