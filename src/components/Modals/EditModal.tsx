import { useState, useEffect } from 'react';

interface EditModalProps {
  items: string[];
  onSave: (items: string[]) => void;
  onClose: () => void;
}

export function EditModal({ items, onSave, onClose }: EditModalProps) {
  const [text, setText] = useState(items.join('\n'));

  useEffect(() => {
    setText(items.join('\n'));
  }, [items]);

  const handleSave = () => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length > 100) {
      alert('В списке слишком много элементов. Не может превышать 100 элементов.');
      return;
    }
    onSave(lines);
    onClose();
  };

  return (
    <div className="pili-modal-overlay" onClick={onClose}>
      <div className="pili-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pili-modal-header">
          <h3 className="pili-modal-title">Изменить</h3>
          <button className="pili-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="pili-modal-body">
          <label className="pili-label">Пожалуйста, войдите в список</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="pili-textarea"
            style={{ minHeight: '300px' }}
            autoFocus
          />
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
            {text.split('\n').filter(line => line.trim() !== '').length} / 100 элементов
          </div>
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
