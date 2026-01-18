interface ControlsProps {
  onReset: () => void;
  disabled?: boolean;
}

export function Controls({
  onReset,
  disabled = false,
}: ControlsProps) {
  const handleResetWithConfirm = () => {
    if (window.confirm('Вы хотите сбросить настройки?')) {
      onReset();
    }
  };

  const handleSpin = () => {
    // Trigger wheel spin - dispatch event or call parent
    window.dispatchEvent(new CustomEvent('spin-wheel'));
  };

  return (
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
    </div>
  );
}
