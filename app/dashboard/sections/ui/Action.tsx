export default function Action({
  icon,
  label,
  onClick,
  accent = 'var(--brand-500)',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="action-btn"
      style={{ '--accent': accent } as React.CSSProperties}
    >
      <div className="action-icon">{icon}</div>
      <span className="action-label">{label}</span>
    </button>
  );
}