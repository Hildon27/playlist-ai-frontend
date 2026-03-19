import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { spotifyService, aiService } from "../../services/api";
import type { SpotifyTrack, GeneratedTrack } from "../../types/spotify";
import { BackLink } from "../../components";
import "./styles.css";

const MAX_SELECTED_TRACKS = 4;
const MIN_SELECTED_TRACKS = 4;

export function PlaylistGenerator() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<SpotifyTrack[]>([]);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistPrivacity, setPlaylistPrivacity] = useState<
    "public" | "private"
  >("private");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlaylist, setGeneratedPlaylist] = useState<
    GeneratedTrack[] | null
  >(null);
  const [error, setError] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;

    async function search() {
      setIsSearching(true);
      setError("");

      try {
        const tracks = await spotifyService.searchTracks(debouncedQuery, 10);
        if (!cancelled) {
          setSearchResults(tracks);
        }
      } catch {
        if (!cancelled) {
          setError("Erro ao buscar músicas. Tente novamente.");
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }

    search();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleSelectTrack = (track: SpotifyTrack) => {
    if (selectedTracks.find((t) => t.id === track.id)) {
      setSelectedTracks((prev) => prev.filter((t) => t.id !== track.id));
    } else if (selectedTracks.length < MAX_SELECTED_TRACKS) {
      setSelectedTracks((prev) => [...prev, track]);
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    setSelectedTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  const handleGeneratePlaylist = async () => {
    if (!playlistName.trim()) {
      setError("Digite um nome para a playlist.");
      return;
    }
    if (selectedTracks.length < MIN_SELECTED_TRACKS) {
      setError(
        `Selecione pelo menos ${MIN_SELECTED_TRACKS} músicas para gerar a playlist.`,
      );
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const seedTracks = selectedTracks.map((track) => ({
        name: track.name,
        artist: track.artist,
        spotifyId: track.id,
      }));

      const response = await aiService.generatePlaylist({
        name: playlistName.trim(),
        seedTracks,
        limit: 20,
        privacity: playlistPrivacity,
      });

      setGeneratedPlaylist(response.tracks);
    } catch {
      setError("Erro ao gerar playlist. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setSelectedTracks([]);
    setGeneratedPlaylist(null);
    setSearchResults([]);
    setSearchQuery("");
    setPlaylistName("");
    setPlaylistPrivacity("private");
  };

  const isTrackSelected = (trackId: string) => {
    return selectedTracks.some((t) => t.id === trackId);
  };

  return (
    <div className="generator-container">
      <header className="generator-header">
        <BackLink onClick={() => navigate("/")} className="back-button">
          ← Voltar
        </BackLink>
        <h1>Criar Playlist com IA</h1>
      </header>

      <main className="generator-main">
        {!generatedPlaylist ? (
          <>
            <section className="selected-section">
              <h2>
                Músicas Selecionadas ({selectedTracks.length}/
                {MAX_SELECTED_TRACKS})
              </h2>

              {selectedTracks.length === 0 ? (
                <p className="empty-message">
                  Busque e selecione {MIN_SELECTED_TRACKS} músicas para gerar
                  sua playlist personalizada
                </p>
              ) : (
                <div className="selected-tracks">
                  {selectedTracks.map((track, index) => (
                    <div key={track.id} className="selected-track">
                      <span className="track-number">{index + 1}</span>
                      {track.albumCover && (
                        <img
                          src={track.albumCover}
                          alt={track.album}
                          className="track-cover-small"
                        />
                      )}
                      <div className="track-info">
                        <span className="track-name">{track.name}</span>
                        <span className="track-artist">{track.artist}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveTrack(track.id)}
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
                <div className="playlist-options">
                  <div className="option-group">
                    <label htmlFor="playlistName">Nome da Playlist</label>
                    <input
                      id="playlistName"
                      type="text"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      placeholder="Ex: Minhas favoritas"
                      maxLength={100}
                    />
                  </div>

                  <div className="option-group">
                    <label htmlFor="playlistPrivacity">Privacidade</label>
                    <select
                      id="playlistPrivacity"
                      value={playlistPrivacity}
                      onChange={(e) =>
                        setPlaylistPrivacity(
                          e.target.value as "public" | "private",
                        )
                      }
                    >
                      <option value="private">Privada</option>
                      <option value="public">Pública</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGeneratePlaylist}
                    className="generate-button"
                    disabled={isGenerating || !playlistName.trim()}
                  >
                    {isGenerating
                      ? "Gerando playlist..."
                      : "✨ Gerar Playlist com IA"}
                  </button>
                </div>
              )}
            </section>

            <section className="search-section">
              <h2>Buscar Músicas</h2>

              <div className="search-form">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite o nome da música ou artista..."
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              {isSearching ? (
                <div className="search-results-skeleton">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="search-result-skeleton">
                      <div className="skeleton-cover skeleton-pulse"></div>
                      <div className="skeleton-details">
                        <div className="skeleton-line skeleton-name skeleton-pulse"></div>
                        <div className="skeleton-line skeleton-artist skeleton-pulse"></div>
                        <div className="skeleton-line skeleton-album skeleton-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((track) => (
                      <div
                        key={track.id}
                        className={`search-result ${isTrackSelected(track.id) ? "selected" : ""}`}
                        onClick={() => handleSelectTrack(track)}
                      >
                        {track.albumCover && (
                          <img
                            src={track.albumCover}
                            alt={track.album}
                            className="track-cover"
                          />
                        )}
                        <div className="track-details">
                          <span className="track-name">{track.name}</span>
                          <span className="track-artist">{track.artist}</span>
                          <span className="track-album">{track.album}</span>
                        </div>
                        <div className="track-action">
                          {isTrackSelected(track.id) ? (
                            <span className="selected-badge">
                              ✓ Selecionada
                            </span>
                          ) : selectedTracks.length >= MAX_SELECTED_TRACKS ? (
                            <span className="limit-badge">Limite atingido</span>
                          ) : (
                            <span className="add-badge">+ Adicionar</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </section>
          </>
        ) : (
          <section className="generated-section">
            <div className="generated-header">
              <h2>Sua Playlist Gerada!</h2>
              <p>
                Baseada nas músicas que você selecionou, aqui estão as
                recomendações:
              </p>
            </div>

            <div className="seeds-summary">
              <h3>Músicas base:</h3>
              <div className="seeds-list">
                {selectedTracks.map((track) => (
                  <span key={track.id} className="seed-tag">
                    {track.name} - {track.artist}
                  </span>
                ))}
              </div>
            </div>

            <div className="generated-tracks">
              {generatedPlaylist.map((track, index) => (
                <div key={track.id} className="generated-track">
                  <span className="track-position">{index + 1}</span>
                  {track.albumCover && (
                    <img
                      src={track.albumCover}
                      alt={track.album}
                      className="track-cover"
                    />
                  )}
                  <div className="track-details">
                    <span className="track-name">{track.name}</span>
                    <span className="track-artist">{track.artist}</span>
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
