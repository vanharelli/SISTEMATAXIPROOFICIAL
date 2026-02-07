import '../styles/modules.css';

export const StatusBadge = ({ unlockedLevel }: { unlockedLevel?: number }) => {
  // Use unlockedLevel to determine status color or text if needed
  const isActive = (unlockedLevel || 1) >= 1;
  return (
    <div className="status-badge-pill">
      <div className={`led-indicator ${isActive ? 'led-green' : 'led-red'}`}></div>
      <span>INSTRUTOR ATIVO</span>
    </div>
  );
};
