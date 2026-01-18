import { categories } from '../data/categories';
import { Link } from 'react-router-dom';

interface FooterProps {
  onCategorySelect?: (items: string[], categoryName: string) => void;
}

export function Footer({ onCategorySelect }: FooterProps) {
  const handleEraseAll = () => {
    if (window.confirm('Удалить все данные?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="footer col-12">
      <div className="row">
        {/* Footer content - centered */}
        <div className="col-12 text-center mt-5">
          <button
            className="btn btn-outline-secondary btn-sm"
            id="erase-all"
            onClick={handleEraseAll}
            style={{ width: '150.56px', height: '31px', border: '1px solid #6c757d', backgroundColor: 'transparent', color: '#6c757d', marginTop: '48px' }}
          >
            Удалить все данные
          </button>

          <div className="base-footer">
            <div>
              <Link to="/" style={{ color: '#007bff' }}>Главная</Link> |{' '}
              <a href="/label/symbols/" style={{ color: '#007bff' }}>Символ</a> |{' '}
              <a href="/label/text/" style={{ color: '#007bff' }}>Красивые шрифты</a> |{' '}
              <a href="/label/time-and-date/" style={{ color: '#007bff' }}>Часы &amp; Таймер</a> |{' '}
              <a href="/label/random/" style={{ color: '#007bff' }}>рулетка &amp; тянуть жребий</a> |{' '}
              <a href="/label/utilities/" style={{ color: '#007bff' }}>программные утилиты</a>
            </div>
            <div>
              <a rel="nofollow" href="/feedback/report/" target="_blank" style={{ color: '#007bff' }}>Сообщить о проблеме</a>
              {' | '}
              <a href="https://pili.app/lnk/*http://global-blog.piliapp.com" style={{ color: '#007bff' }}>Блог</a>
              {' | '}
              <a href="/page/privacy/" style={{ color: '#007bff' }}>Конфиденциальность</a>
              {' | '}
              <a href="/page/terms/" style={{ color: '#007bff' }}>Условия использования</a>
              {' | '}
              <a id="languages" href="/page/language/" style={{ color: '#007bff' }}>🌐</a> | © 2026
            </div>
            <div>
              ᴅᴇsɪɢɴᴇᴅ ʙʏ{' '}
              <a
                style={{ fontVariant: 'small-caps', opacity: '.7', color: '#007bff' }}
                href="https://pili.app/index/ru.html"
              >
                pili.app
              </a>
              {' '}
              <span id="footer-from">ɪɴ ᴛᴀɪᴡᴀɴ</span>
              <span id="footer-thx"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
