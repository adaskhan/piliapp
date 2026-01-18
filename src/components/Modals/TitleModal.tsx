import { useState, useEffect } from 'react';

interface TitleModalProps {
  title: string;
  onSave: (title: string) => void;
  onClose: () => void;
}

export function TitleModal({ title, onSave, onClose }: TitleModalProps) {
  const [value, setValue] = useState(title);

  useEffect(() => {
    setValue(title);
  }, [title]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onSave(trimmed);
      onClose();
    }
  };

  return (
    <div className="pili-modal-overlay" onClick={onClose}>
      <div className="pili-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pili-modal-header">
          <h3 className="pili-modal-title">Заголовок</h3>
          <button className="pili-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="pili-modal-body">
          <label className="pili-label">Введите заголовок</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="pili-input"
            autoFocus
          />
        </div>
        <div className="pili-modal-footer">
          <button className="pili-action-btn" onClick={onClose}>
            Отмена
          </button>
          <button className="pili-btn pili-btn-start" onClick={handleSave}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
