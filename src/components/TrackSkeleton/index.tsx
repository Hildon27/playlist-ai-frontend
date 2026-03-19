export function TrackSkeleton() {
  return (
    <div className="track-item track-skeleton">
      <span className="track-number skeleton-pulse"></span>
      <div className="track-main">
        <div className="track-cover-placeholder skeleton-pulse"></div>
        <div className="track-info">
          <span className="track-name skeleton-pulse skeleton-text"></span>
          <span className="track-artist skeleton-pulse skeleton-text-small"></span>
        </div>
      </div>
      <span className="track-album skeleton-pulse skeleton-text"></span>
      <span className="track-duration skeleton-pulse skeleton-text-small"></span>
      <div className="track-actions"></div>
    </div>
  );
}
