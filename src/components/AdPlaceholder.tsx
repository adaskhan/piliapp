import { useState } from 'react';

interface AdPlaceholderProps {
  onClose?: () => void;
}

export function AdPlaceholder({ onClose }: AdPlaceholderProps) {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  const handleClose = () => {
    setClosed(true);
    onClose?.();
  };

  return (
    <div className="pili-left-ad">
      <div className="pili-ad-block">
        <button
          onClick={handleClose}
          className="pili-ad-close"
          title="Закрыть (X)"
        >
          ×
        </button>
        <p>Рекламный блок</p>
        <p style={{ fontSize: '12px', marginTop: '8px' }}>260 × 250</p>
      </div>
    </div>
  );
}
