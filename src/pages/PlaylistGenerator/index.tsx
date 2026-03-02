import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { spotifyService, aiService } from '../../services/api';
import type { SpotifyTrack } from '../../types/spotify';
import './styles.css';

const MAX_SELECTED_TRACKS = 5;
const MIN_SELECTED_TRACKS = 1;

export function PlaylistGenerator() {
  const navigate = useNavigate();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Selection state
  const [selectedTracks, setSelectedTracks] = useState<SpotifyTrack[]>([]);
  
  // Playlist name state
  const [playlistName, setPlaylistName] = useState('');
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlaylist, setGeneratedPlaylist] = useState<SpotifyTrack[] | null>(null);
  const [aiMessage, setAiMessage] = useState('');
  
  // Error state
  const [error, setError] = useState('');

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      const tracks = await spotifyService.searchTracks(searchQuery, 10);
      setSearchResults(tracks);
    } catch {
      setError('Erro ao buscar músicas. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    if (selectedTracks.find(t => t.spotifyId === track.spotifyId)) {
      // Remove if already selected
      setSelectedTracks(prev => prev.filter(t => t.spotifyId !== track.spotifyId));
    } else if (selectedTracks.length < MAX_SELECTED_TRACKS) {
      // Add if under limit
      setSelectedTracks(prev => [...prev, track]);
    }
  };

  const handleRemoveTrack = (spotifyId: string) => {
    setSelectedTracks(prev => prev.filter(t => t.spotifyId !== spotifyId));
  };

  const handleGeneratePlaylist = async () => {
    if (selectedTracks.length < MIN_SELECTED_TRACKS) {
      setError(`Selecione pelo menos ${MIN_SELECTED_TRACKS} música(s) para gerar a playlist.`);
      return;
    }

    if (!playlistName.trim()) {
      setError('Digite um nome para a playlist.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const seedTracks = selectedTracks.map(track => ({
        name: track.name,
        artist: track.artists[0] || '',
        spotifyId: track.spotifyId,
      }));

      const response = await aiService.generatePlaylist({
        name: playlistName,
        seedTracks,
        limit: 20,
        privacity: 'public',
      });

      // Extrair as tracks geradas da resposta
      const generatedTracks = response.data?.aiGeneration?.generatedTracks || [];
      const message = response.data?.aiGeneration?.message || '';
      
      setGeneratedPlaylist(generatedTracks);
      setAiMessage(message);
    } catch {
      setError('Erro ao gerar playlist. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setSelectedTracks([]);
    setGeneratedPlaylist(null);
    setSearchResults([]);
    setSearchQuery('');
    setPlaylistName('');
    setAiMessage('');
  };

  const isTrackSelected = (spotifyId: string) => {
    return selectedTracks.some(t => t.spotifyId === spotifyId);
  };

  // Helper para formatar artistas
  const formatArtists = (artists: string[]) => {
    return artists.join(', ');
  };

  return (
    <div className="generator-container">
      <header className="generator-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Voltar
        </button>
        <h1>🎵 Criar Playlist com IA</h1>
      </header>

      <main className="generator-main">
        {!generatedPlaylist ? (
          <>
            {/* Selected Tracks Section */}
            <section className="selected-section">
              <h2>Músicas Selecionadas ({selectedTracks.length}/{MAX_SELECTED_TRACKS})</h2>
              
              {selectedTracks.length === 0 ? (
                <p className="empty-message">
                  Busque e selecione até {MAX_SELECTED_TRACKS} músicas para gerar sua playlist personalizada
                </p>
              ) : (
                <div className="selected-tracks">
                  {selectedTracks.map((track, index) => (
                    <div key={track.spotifyId} className="selected-track">
                      <span className="track-number">{index + 1}</span>
                      {track.albumCover && (
                        <img src={track.albumCover} alt={track.album} className="track-cover-small" />
                      )}
                      <div className="track-info">
                        <span className="track-name">{track.name}</span>
                        <span className="track-artist">{formatArtists(track.artists)}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveTrack(track.spotifyId)}
                        className="remove-button"
                        title="Remover música"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedTracks.length >= MIN_SELECTED_TRACKS && (
                <div className="generate-section">
                  <div className="playlist-name-input">
                    <label htmlFor="playlistName">Nome da Playlist</label>
                    <input
                      id="playlistName"
                      type="text"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      placeholder="Minha playlist incrível..."
                      disabled={isGenerating}
                    />
                  </div>
                  <button 
                    onClick={handleGeneratePlaylist}
                    className="generate-button"
                    disabled={isGenerating || !playlistName.trim()}
                  >
                    {isGenerating ? 'Gerando playlist...' : '✨ Gerar Playlist com IA'}
                  </button>
                </div>
              )}
            </section>

            {/* Search Section */}
            <section className="search-section">
              <h2>Buscar Músicas</h2>
              
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite o nome da música ou artista..."
                  disabled={isSearching}
                />
                <button type="submit" disabled={isSearching || !searchQuery.trim()}>
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
              </form>

              {error && <div className="error-message">{error}</div>}

              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(track => (
                    <div 
                      key={track.spotifyId} 
                      className={`search-result ${isTrackSelected(track.spotifyId) ? 'selected' : ''}`}
                      onClick={() => handleSelectTrack(track)}
                    >
                      {track.albumCover && (
                        <img src={track.albumCover} alt={track.album} className="track-cover" />
                      )}
                      <div className="track-details">
                        <span className="track-name">{track.name}</span>
                        <span className="track-artist">{formatArtists(track.artists)}</span>
                        <span className="track-album">{track.album}</span>
                      </div>
                      <div className="track-action">
                        {isTrackSelected(track.spotifyId) ? (
                          <span className="selected-badge">✓ Selecionada</span>
                        ) : selectedTracks.length >= MAX_SELECTED_TRACKS ? (
                          <span className="limit-badge">Limite atingido</span>
                        ) : (
                          <span className="add-badge">+ Adicionar</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          /* Generated Playlist Section */
          <section className="generated-section">
            <div className="generated-header">
              <h2>🎉 Playlist "{playlistName}" Criada!</h2>
              <p>Baseada nas músicas que você selecionou, aqui estão as recomendações:</p>
            </div>

            {aiMessage && (
              <div className="ai-message">
                <span className="ai-icon">🤖</span>
                <p>{aiMessage}</p>
              </div>
            )}

            <div className="seeds-summary">
              <h3>Músicas base:</h3>
              <div className="seeds-list">
                {selectedTracks.map(track => (
                  <span key={track.spotifyId} className="seed-tag">
                    {track.name} - {formatArtists(track.artists)}
                  </span>
                ))}
              </div>
            </div>

            <div className="generated-tracks">
              {generatedPlaylist.map((track, index) => (
                <div key={track.spotifyId} className="generated-track">
                  <span className="track-position">{index + 1}</span>
                  {track.albumCover && (
                    <img src={track.albumCover} alt={track.album} className="track-cover" />
                  )}
                  <div className="track-details">
                    <span className="track-name">{track.name}</span>
                    <span className="track-artist">{formatArtists(track.artists)}</span>
                    <span className="track-album">{track.album}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="generated-actions">
              <button onClick={handleStartOver} className="start-over-button">
                Criar Nova Playlist
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
