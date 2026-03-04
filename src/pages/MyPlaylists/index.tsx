import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { playlistService } from '../../services/api';
import type { Playlist } from '../../types/playlist';
import './styles.css';

export function MyPlaylists() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function loadPlaylists() {
      try {
        setLoading(true);
        setError(null);
        const response = await playlistService.getMyPlaylists(page, 10);
        setPlaylists(response.data || []);
        setTotalPages(response.meta?.totalPages || 1);
      } catch (err) {
        console.error('Erro ao carregar playlists:', err);
        setError('Não foi possível carregar suas playlists.');
      } finally {
        setLoading(false);
      }
    }
    
    loadPlaylists();
  }, [page]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Deseja realmente excluir a playlist "${name}"?`)) {
      return;
    }

    try {
      await playlistService.deletePlaylist(id);
      setPlaylists(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Erro ao excluir playlist:', err);
      alert('Não foi possível excluir a playlist.');
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="my-playlists-container">
        <div className="loading">Carregando playlists...</div>
      </div>
    );
  }

  return (
    <div className="my-playlists-container">
      <header className="playlists-header">
        <h1>Minhas Playlists</h1>
        <button onClick={() => navigate('/create-playlist')} className="create-btn">
          + Nova Playlist
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {playlists.length === 0 ? (
        <div className="empty-state">
          <p>Você ainda não tem nenhuma playlist.</p>
          <Link to="/create-playlist" className="create-link">
            Criar minha primeira playlist
          </Link>
        </div>
      ) : (
        <>
          <div className="playlists-grid">
            {playlists.map(playlist => (
              <div key={playlist.id} className="playlist-card">
                <div className="playlist-info">
                  <h3 className="playlist-name">{playlist.name}</h3>
                  <span className={`privacity-badge ${playlist.privacity.toLowerCase()}`}>
                    {playlist.privacity === 'PUBLIC' ? 'Pública' : 'Privada'}
                  </span>
                  <p className="playlist-date">Criada em {formatDate(playlist.createdAt)}</p>
                  {playlist.aiMessage && (
                    <p className="ai-message">{playlist.aiMessage}</p>
                  )}
                </div>
                <div className="playlist-actions">
                  <Link to={`/playlists/${playlist.id}`} className="view-btn">
                    Ver detalhes
                  </Link>
                  <button 
                    onClick={() => handleDelete(playlist.id, playlist.name)}
                    className="delete-btn"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setPage(p => p - 1)} 
                disabled={page === 1}
                className="page-btn"
              >
                Anterior
              </button>
              <span className="page-info">
                Página {page} de {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => p + 1)} 
                disabled={page === totalPages}
                className="page-btn"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      <Link to="/" className="back-link">← Voltar ao início</Link>
    </div>
  );
}
