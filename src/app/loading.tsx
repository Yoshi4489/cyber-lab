export default function Loading() {
  return (
    <div role="status" className="loading-state">
      <span className="sr-only">Loading the range…</span>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-hero" />
      <div className="lab-grid">
        {[0, 1, 2].map((id) => (
          <div className="skeleton skeleton-card" key={id} />
        ))}
      </div>
    </div>
  );
}
