type CreatePlaylistCardProps = {
  onClick: () => void;
};

export function CreatePlaylistCard({ onClick }: CreatePlaylistCardProps) {
  return (
    <div className="playlist-card create-card" onClick={onClick}>
      <div className="create-icon">＋</div>
      <h3>Criar Nova Playlist</h3>
      <p>Use IA para gerar playlists inteligentes</p>
    </div>
  );
}
