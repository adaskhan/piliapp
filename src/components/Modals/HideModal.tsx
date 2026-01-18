import { useState } from 'react';

interface HideModalProps {
  items: string[];
  hiddenIndices: number[];
  onSave: (hiddenIndices: number[]) => void;
  onClose: () => void;
}

export function HideModal({ items, hiddenIndices, onSave, onClose }: HideModalProps) {
  const [selected, setSelected] = useState<number[]>(hiddenIndices);

  const handleToggle = (index: number) => {
    setSelected(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  return (
    <div className="pili-modal-overlay" onClick={onClose}>
      <div className="pili-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="pili-modal-header">
          <h3 className="pili-modal-title">Скрывать</h3>
          <button className="pili-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="pili-modal-body">
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {items.map((item, index) => (
              <label
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 0',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(index)}
                  onChange={() => handleToggle(index)}
                  style={{ cursor: 'pointer' }}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          {selected.length > 0 && (
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
              Выбрано элементов: {selected.length}
            </div>
          )}
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
