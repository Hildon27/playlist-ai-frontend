import { IoGlobe, IoLockClosed } from "react-icons/io5";
import { CoverMosaic } from "../CoverMosaic";
import { formatDate } from "../../utils/date";
import type { Playlist } from "../../types/playlist";

type PlaylistCardProps = {
  playlist: Playlist;
  onClick: () => void;
};

export function PlaylistCard({ playlist, onClick }: PlaylistCardProps) {
  const playlistCovers = playlist.coverImages ?? [];

  return (
    <div className="playlist-card" onClick={onClick}>
      <CoverMosaic coverImages={playlistCovers} variant="card" />
      <div className="card-header">
        <h3>{playlist.name}</h3>
        <span className={`privacity-badge ${playlist.privacity.toLowerCase()}`}>
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
      <span className="card-date">{formatDate(playlist.createdAt)}</span>
    </div>
  );
}
