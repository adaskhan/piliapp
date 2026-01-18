import { useState } from 'react';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="container">
      <div className="row no-gutters">
        <div className="col-12 g-0">
          <nav className="navbar navbar-expand-lg navbar-dark bg-dark" aria-label="breadcrumb">
            <a className="navbar-brand d-none d-lg-inline-block" href="https://ru.piliapp.com">
              <i className="bi-home"></i>
              <span id="piliapp-home-text" data-h="Главная" data-n="PiliApp">Главная</span>
            </a>

            <button
              className="navbar-toggler"
              type="button"
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className={`navbar-collapse ${menuOpen ? 'show' : ''}`} id="navbar">
              <ul className="navbar-nav mr-auto">
                <li className="nav-item active">
                  <a className="nav-link active" href="/random/wheel/">рулетка</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/random/dice/">игральная кость</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/random/number/">случайные числа</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/random/coin/">монета</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/random/list/">тасовать</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/random/lots/">тянуть жребий</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/timer/countdown/">Таймер</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/time/">Часы</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/scoreboard/">Табло</a>
                </li>
              </ul>

              <span
                id="screen-btn"
                className="btn btn-sm btn-outline float-right navbar-text d-xl-flex"
                onClick={() => {
                  if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                  }
                }}
              >
                Во весь экран <u></u> <i className="bi-x"></i>
              </span>
            </div>

            <a
              id="live-btn"
              className="live-btn navbar-text btn btn-sm btn-outline float-right fs-hide"
              data-google-interstitial="false"
              rel="nofollow"
              href="/random/wheel/live/"
              title="Вы создаёте общедоступную комнату прямой трансляции. Поделитесь ссылкой со зрителями для просмотра в реальном времени."
              data-rules="Вы несёте ответственность за весь контент.
Не создавайте неприемлемый или незаконный контент."
              onClick={(e) => {
                const title = e.currentTarget.title;
                const rules = e.currentTarget.dataset.rules;
                if (confirm(title + `\n\n` + rules)) {
                  return true;
                }
                e.preventDefault();
                return false;
              }}
            >
              <i></i>Эфир
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
}
