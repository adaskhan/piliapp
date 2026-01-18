interface ResultAlertProps {
  result: string;
  onClose: () => void;
  onHide: () => void;
  sectorColor?: string;
}

export function ResultAlert({ result, onClose, onHide, sectorColor = '#e74c3c' }: ResultAlertProps) {
  return (
    <div style={{
      backgroundColor: sectorColor,
      borderRadius: '0.5rem',
      padding: '0',
      textAlign: 'center',
      position: 'relative',
      width: '100%',
      height: '40px',
      margin: '0 auto 15px auto',
    }}>
      {/* Close button X - left */}
      <button
        onClick={onClose}
        className="result-close-btn"
        style={{
          position: 'absolute',
          top: '50%',
          left: '10px',
          transform: 'translateY(-50%)',
          background: '#EFEFEF',
          border: '2px solid black',
          borderRadius: '3px',
          fontSize: '25px',
          color: 'black',
          cursor: 'pointer',
          width: '30.67px',
          height: '28px',
          lineHeight: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Закрыть (X)"
      >
        ×
      </button>

      {/* Hide button S (strikethrough) - right */}
      <button
        onClick={onHide}
        className="result-hide-btn"
        style={{
          position: 'absolute',
          top: '50%',
          right: '10px',
          transform: 'translateY(-50%)',
          background: '#EFEFEF',
          border: '2px solid black',
          borderRadius: '3px',
          fontSize: '25px',
          fontWeight: 'bold',
          color: 'black',
          cursor: 'pointer',
          width: '30.67px',
          height: '28px',
          lineHeight: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'line-through',
        }}
        title="Скрыть выбранный элемент (S)"
      >
        S
      </button>

      {/* Result */}
      <div style={{
        fontSize: '39px',
        fontWeight: '400',
        color: 'black',
        lineHeight: '40px',
      }} className="result-text">
        {result}
      </div>
    </div>
  );
}
