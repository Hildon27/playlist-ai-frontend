import { Link } from 'react-router-dom';

type HomeHeaderProps = {
  userName: string;
  onLogout: () => void;
};

export function HomeHeader({ userName, onLogout }: HomeHeaderProps) {
  return (
    <header className="home-header">
      <h1>Playlist AI</h1>
      <div className="user-info">
        <span className="user-name">Olá, {userName}</span>
        <Link to="/profile" className="profile-link">
          Meu Perfil
        </Link>
        <button onClick={onLogout} className="logout-button">
          Sair
        </button>
      </div>
    </header>
  );
}
