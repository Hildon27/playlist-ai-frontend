type CarouselControlsProps = {
  onLeft: () => void;
  onRight: () => void;
};

export function CarouselControls({ onLeft, onRight }: CarouselControlsProps) {
  return (
    <div className="carousel-controls">
      <button
        className="carousel-btn"
        onClick={onLeft}
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        className="carousel-btn"
        onClick={onRight}
        aria-label="Próximo"
      >
        ›
      </button>
    </div>
  );
}
