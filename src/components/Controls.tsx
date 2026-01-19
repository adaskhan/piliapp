interface ControlsProps {
  onReset: () => void;
  disabled?: boolean;
  spinMode?: 'random' | 'selected';
  onSpinModeChange?: (mode: 'random' | 'selected') => void;
  selectedIndex?: number | null;
  onSelectedIndexChange?: (index: number | null) => void;
  items?: string[];
}

export function Controls({
  onReset,
  disabled = false,
  spinMode = 'random',
  onSpinModeChange,
  selectedIndex,
  onSelectedIndexChange,
  items = [],
}: ControlsProps) {
  const handleResetWithConfirm = () => {
    if (window.confirm('Вы хотите сбросить настройки?')) {
      onReset();
    }
  };

  const handleSpin = () => {
    // Trigger wheel spin - dispatch event or call parent
    window.dispatchEvent(new CustomEvent('spin-wheel', {
      detail: { spinMode, selectedIndex }
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
      {/* All buttons in one row */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="button"
          value="Старт"
          className="spin-btn btn btn-primary btn-lg"
          onClick={handleSpin}
          disabled={disabled}
        />
        <input
          type="button"
          value="Сбросить"
          title="показать все скрытые предметы"
          className="reset-btn btn btn-danger btn-sm"
          onClick={handleResetWithConfirm}
          disabled={disabled}
        />
        {/* R/S Mode Toggle - Circular buttons */}
        <button
          className={`btn ${spinMode === 'random' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => onSpinModeChange?.('random')}
          disabled={disabled}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          R
        </button>
        <button
          className={`btn ${spinMode === 'selected' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => onSpinModeChange?.('selected')}
          disabled={disabled}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          S
        </button>
      </div>
    </div>
  );
}
