import { useAuth } from '../../contexts/AuthContext';
import './styles.css';

export function Home() {
  const { user, logout } = useAuth();

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
        <div className="welcome-card">
          <h2>Bem-vindo ao Playlist AI!</h2>
          <p>Crie playlists inteligentes usando inteligência artificial.</p>
          <div className="user-details">
            <p><strong>Nome:</strong> {user?.firstName} {user?.lastName}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Privacidade:</strong> {user?.privacity === 'public' ? 'Público' : 'Privado'}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
