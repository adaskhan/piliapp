export function HotkeysHelp() {
  const shortcuts = [
    { key: 'SPACE', action: 'покрутите' },
    { key: 'X', action: 'закрыть баннер' },
    { key: 'S', action: 'скрыть выбранный элемент' },
    { key: 'R', action: 'Сбросить' },
    { key: 'E', action: 'Изменить' },
    { key: 'F', action: 'Во весь экран' },
  ];

  return (
    <div className="pili-hotkeys-panel">
      {shortcuts.map(({ key, action }) => (
        <div key={key} className="pili-hotkey-item">
          <span className="pili-hotkey-key">{key}</span>
          <span className="pili-hotkey-desc">{action}</span>
        </div>
      ))}
    </div>
  );
}
