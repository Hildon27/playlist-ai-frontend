import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { playlistService, userService } from "../../services/api";
import type { Playlist } from "../../types/playlist";
import { PlaylistCarousel } from "../../components/PlaylistCarousel";
import "./styles.css";
import type { UserResponseDTO } from "../../types/user";
import { UsersCarousel } from "../../components/UsersCarousel";

export function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [publicPlaylists, setPublicPlaylists] = useState<Playlist[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingPublic, setLoadingPublic] = useState(true);

  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [myPlaylists, publicData] = await Promise.all([
          playlistService.getMyPlaylists(1, 20),
          playlistService.getPublicPlaylists(1, 20),
        ]);

        setPlaylists(myPlaylists.data || []);
        setPublicPlaylists(publicData.data || []);

        const [usersData] = await Promise.all([userService.getAll(1, 20)]);

        setUsers(usersData.data || []);
        setLoadingUsers(false);
      } catch (err) {
        console.error("Erro ao carregar playlists:", err);
      } finally {
        setLoading(false);
        setLoadingPublic(false);
      }
    }

    loadData();
  }, []);

  function renderCovers(playlist: Playlist) {
    const playlistCovers = playlist.coverImages;

    if (!playlistCovers || playlistCovers.length === 0) {
      return (
        <div className="cover-wrapper">
          <div className="cover-mosaic placeholder-mosaic">
            <span>🎵</span>
          </div>
        </div>
      );
    }

    const slots = [...playlistCovers];

    while (slots.length < 4) {
      slots.push(playlistCovers[slots.length % playlistCovers.length]);
    }

    return (
      <div className="cover-wrapper">
        <div className="cover-mosaic">
          {slots.map((cover, i) => (
            <img key={i} src={cover} alt="" className="cover-tile" />
          ))}
        </div>
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
        <div>
          <PlaylistCarousel
            title="Minhas Playlists"
            playlists={playlists}
            loading={loading}
            renderCovers={renderCovers}
          />
          <div
            className="playlist-card create-card"
            onClick={() => navigate("/create-playlist")}
          >
            <div className="create-icon">＋</div>
            <h3>Criar Nova Playlist</h3>
            <p>Use IA para gerar playlists inteligentes</p>
          </div>
          {!loading && playlists.length === 0 && (
            <p className="empty-message">
              Você ainda não tem playlists. Crie sua primeira! ✨
            </p>
          )}
        </div>

        <div>
          <PlaylistCarousel
            title="Playlists Públicas"
            playlists={publicPlaylists}
            loading={loadingPublic}
            renderCovers={renderCovers}
          />
          {!loadingPublic && publicPlaylists.length === 0 && (
            <p className="empty-message">
              Nenhuma playlist pública encontrada. Que tal criar a sua? ✨
            </p>
          )}
        </div>

        <div>
          <UsersCarousel
            title="Usuários Públicos"
            users={users}
            loading={loadingUsers}
          />
          {!loadingUsers && users.length === 0 && (
            <p className="empty-message">
              Nenhuma usuário com perfil público encontrado ✨
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
