type CoverMosaicProps = {
  coverImages: string[];
  /** Use 'card' for Home playlist cards (cover-wrapper, cover-tile), 'detail' for PlaylistDetail (mosaic-img) */
  variant?: 'card' | 'detail';
};

export function CoverMosaic({ coverImages, variant = 'card' }: CoverMosaicProps) {
  if (!coverImages || coverImages.length === 0) {
    if (variant === 'card') {
      return (
        <div className="cover-wrapper">
          <div className="cover-mosaic placeholder-mosaic">
            <span>🎵</span>
          </div>
        </div>
      );
    }
    return null;
  }

  const slots = [...coverImages];
  while (slots.length < 4) {
    slots.push(coverImages[slots.length % coverImages.length]);
  }

  const tiles = slots.slice(0, 4).map((cover, i) => (
    variant === 'card' ? (
      <img key={i} src={cover} alt="" className="cover-tile" />
    ) : (
      <img key={i} src={cover} alt="" className="mosaic-img" />
    )
  ));

  if (variant === 'card') {
    return (
      <div className="cover-wrapper">
        <div className="cover-mosaic">
          {tiles}
        </div>
      </div>
    );
  }

  return <div className="cover-mosaic">{tiles}</div>;
}
