type PlaylistDetailCoverProps = {
  coverImages: string[];
  playlistName: string;
};

export function PlaylistDetailCover({ coverImages, playlistName }: PlaylistDetailCoverProps) {
  if (coverImages.length >= 4) {
    return (
      <div className="cover-mosaic">
        {coverImages.slice(0, 4).map((cover, i) => (
          <img key={i} src={cover} alt="" className="mosaic-img" />
        ))}
      </div>
    );
  }
  if (coverImages.length > 0) {
    return <img src={coverImages[0]} alt={playlistName} />;
  }
  return <div className="placeholder-cover">🎵</div>;
}
