import type { WheelSettings } from '../../types';

interface SettingsModalProps {
  settings: WheelSettings;
  onSave: (settings: Partial<WheelSettings>) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  return (
    <div className="pili-modal-overlay" onClick={onClose}>
      <div className="pili-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pili-modal-header">
          <h3 className="pili-modal-title">Закончить</h3>
          <button className="pili-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="pili-modal-body">
          <label className="pili-label pili-mb-3">
            <input
              type="checkbox"
              checked={settings.autoHide}
              onChange={(e) => onSave({ autoHide: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            Скрывать выбранные элементы
          </label>

          <label className="pili-label pili-mb-3">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onSave({ soundEnabled: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            Включить звук
          </label>

          <div style={{ marginTop: '20px', padding: '12px', background: '#f8f9fa', borderRadius: '4px', fontSize: '13px', color: '#666' }}>
            <strong>Скрывать...</strong>
            <p style={{ margin: '8px 0 0 0' }}>
              Когда этот параметр включен, выбранный элемент будет автоматически удаляться из списка после вращения.
            </p>
          </div>
        </div>
        <div className="pili-modal-footer">
          <button className="pili-btn pili-btn-start" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
