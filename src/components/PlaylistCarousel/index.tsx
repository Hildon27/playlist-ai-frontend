import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoGlobe, IoLockClosed } from "react-icons/io5";
import type { Playlist } from "../../types/playlist";

interface PlaylistCarouselProps {
  title: string;
  playlists: Playlist[];
  loading?: boolean;
  renderCovers: (playlist: Playlist) => React.ReactNode;
}

export function PlaylistCarousel({
  title,
  playlists,
  loading,
  renderCovers,
}: PlaylistCarouselProps) {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);

  function scrollCarousel(direction: "left" | "right") {
    if (!carouselRef.current) return;

    carouselRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>

        <div className="carousel-controls">
          <button
            className="carousel-btn"
            onClick={() => scrollCarousel("left")}
          >
            ‹
          </button>

          <button
            className="carousel-btn"
            onClick={() => scrollCarousel("right")}
          >
            ›
          </button>
        </div>
      </div>

      <div className="carousel-container">
        <div className="playlists-carousel" ref={carouselRef}>
          {loading ? (
            <>
              <div className="playlist-card skeleton-card">
                <div className="skeleton-cover" />
                <div className="skeleton-line wide" />
              </div>

              <div className="playlist-card skeleton-card">
                <div className="skeleton-cover" />
                <div className="skeleton-line wide" />
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

                  <span
                    className={`privacity-badge ${playlist.privacity.toLowerCase()}`}
                  >
                    {playlist.privacity.toUpperCase() === "PUBLIC" ? (
                      <IoGlobe size={16} />
                    ) : (
                      <IoLockClosed size={16} />
                    )}
                  </span>
                </div>

                {playlist.aiMessage && (
                  <p className="card-description">{playlist.aiMessage}</p>
                )}

                <span className="card-date">
                  {formatDate(playlist.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
