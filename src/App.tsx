import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import WheelBlock from './components/WheelBlock';
import { SidebarList } from './components/SidebarList';
import { Controls } from './components/Controls';
import { ResultAlert } from './components/ResultAlert';
import { Footer } from './components/Footer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useHotkeys } from './hooks/useHotkeys';
import { getColor } from './utils/wheelColors';
import type { HotkeyAction } from './types';
import './styles/piliapp.css';

function App() {
  const { state, updateItems, updateTitle } = useLocalStorage();
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const [selectedValue, setSelectedValue] = useState<string | undefined>();
  const [hiddenIndices, setHiddenIndices] = useState<number[]>([]);
  const [showResultAlert, setShowResultAlert] = useState(false);
  const [forceEditMode, setForceEditMode] = useState(false);
  const [forceHideMode, setForceHideMode] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleEditTitle = useCallback(() => {
    setShowResultAlert(false);
    const newTitle = prompt('Пожалуйста, введите новое название:', state.title);
    if (newTitle !== null && newTitle.trim() !== '') {
      updateTitle(newTitle.trim());
    }
  }, [state.title, updateTitle]);

  const handleCloseResultAlert = useCallback(() => {
    setShowResultAlert(false);
  }, []);

  const handleHideSelected = useCallback(() => {
    if (selectedValue !== undefined && state.items.length > 1) {
      const originalIndex = state.items.findIndex(item => item === selectedValue);
      if (originalIndex !== -1) {
        setHiddenIndices([...hiddenIndices, originalIndex]);
      }
      setSelectedIndex(undefined);
      setSelectedValue(undefined);
      setShowResultAlert(false);
    }
  }, [selectedValue, hiddenIndices, state.items]);

  const visibleItems = state.items.filter((_, i) => !hiddenIndices.includes(i));

  const handleReset = useCallback(() => {
    setShowResultAlert(false);
    setSelectedIndex(undefined);
    setSelectedValue(undefined);
    setHiddenIndices([]);
    setForceEditMode(false);
    setForceHideMode(false);
  }, []);

  const handleItemsChange = useCallback((items: string[]) => {
    setShowResultAlert(false);
    updateItems(items);
  }, [updateItems]);

  const handleCategorySelect = useCallback((items: string[], categoryName: string) => {
    setShowResultAlert(false);
    updateItems(items);
    updateTitle(categoryName);
    setHiddenIndices([]);
  }, [updateItems, updateTitle]);

  const handleHideModeChange = useCallback((isHiding: boolean) => {
    if (!isHiding) {
      setForceHideMode(false);
    }
  }, []);

  const handleHotkeyAction = useCallback((action: HotkeyAction) => {
    switch (action) {
      case 'spin':
        setShowResultAlert(false);
        break;
      case 'closeAlert':
        if (showResultAlert) {
          handleCloseResultAlert();
        }
        break;
      case 'hideSelected':
        setShowResultAlert(false);
        if (showResultAlert) {
          handleHideSelected();
        } else if (selectedIndex !== undefined && state.items.length > 1) {
          const currentVisibleItems = state.items.filter((_, i) => !hiddenIndices.includes(i));
          const selectedValue = currentVisibleItems[selectedIndex];
          if (selectedValue) {
            const originalIndex = state.items.findIndex(item => item === selectedValue);
            if (originalIndex !== -1) {
              setHiddenIndices([...hiddenIndices, originalIndex]);
            }
          }
          setSelectedIndex(undefined);
          setForceEditMode(false);
          setForceHideMode(true); // Enter hide mode to show hidden items
        }
        break;
      case 'reset':
        if (window.confirm('Вы хотите сбросить настройки?')) {
          handleReset();
        }
        break;
      case 'edit':
        setShowResultAlert(false);
        setForceEditMode(prev => !prev);
        break;
      case 'fullscreen':
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
        break;
    }
  }, [selectedIndex, state.items, handleReset, showResultAlert, handleCloseResultAlert, handleHideSelected, hiddenIndices, setForceHideMode]);

  useHotkeys({ onAction: handleHotkeyAction, disabled: false });

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Main Content Container */}
      <div className="container">
        {/* Ads Bar */}
        <div className="row no-gutters">
          <div id="adsbar" className="col-12 col-xl-3">
            <style>
              {`@media (min-width:0px){.ads-auto.idx-0{display:block;width:320px;min-height:100px;}}
              @media (min-width:768px){.ads-auto.idx-0{display:block;width:728px;min-height:90px;}}
              @media (min-width:1200px){.ads-auto.idx-0{display:block;width:300px;min-height:250px;}}
              @media (min-width:1360px){.ads-auto.idx-0{display:block;width:336px;min-height:280px;}}
              .ads-auto.idx-0.hide{display:none;}
              @media (max-width:1199px){.ads-auto.idx-1{display:none;}}
              @media (min-width:1200px){.ads-auto.idx-1{display:block;width:300px;min-height:250px;}}
              @media (min-width:1360px){.ads-auto.idx-1{display:block;width:336px;min-height:280px;}}
              .ads-auto.idx-1.hide{display:none;}`}
            </style>
            <div id="dfp-0" className="ads ads-auto idx-0" style={{ alignItems: 'center', justifyContent: 'center', paddingTop: '10px' }}>
              <span style={{ fontSize: '14px', color: '#666', textAlign: 'center', display: 'block', width: '100%' }}>
                Объявления закрыто <span style={{ fontFamily: 'Product Sans, Arial, sans-serif', fontWeight: 500 }}>Google</span>
              </span>
            </div>
            <div id="dfp-1" className="ads ads-auto idx-1" style={{ alignItems: 'center', justifyContent: 'center', paddingTop: '10px' }}>
              <span style={{ fontSize: '14px', color: '#666', textAlign: 'center', display: 'block', width: '100%' }}>
                Объявления закрыто <span style={{ fontFamily: 'Product Sans, Arial, sans-serif', fontWeight: 500 }}>Google</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main piliapp block */}
        <div id="piliapp" className="row">
          <div className="col-12">
            {/* Header Row */}
            <div className="row">
              {/* Title or Result Alert */}
              {showResultAlert && selectedValue ? (
                <div id="header" className="col-12 text-center pt-3 pb-3 col-xl-6 offset-xl-3" style={{ marginTop: '17px', marginBottom: '20px' }}>
                  <ResultAlert
                    result={selectedValue}
                    onClose={handleCloseResultAlert}
                    onHide={handleHideSelected}
                    sectorColor={getColor(selectedIndex || 0)}
                  />
                </div>
              ) : (
                <div id="header" className="col-12 text-center pt-3 pb-3 col-xl-6 offset-xl-3" style={{ marginTop: '17px', marginBottom: '20px' }}>
                  <h1>{state.title}</h1>
                </div>
              )}

              {/* Desktop Controls (Right Side) */}
              <div className="d-none align-items-center justify-content-center col-xl-3 d-xl-flex">
                <div className="d-flex flex-column justify-content-center align-items-center">
                  <Controls
                    onReset={handleReset}
                    disabled={visibleItems.length === 0}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="row">
              {/* Wheel Section */}
              <div id="results" className="col-12 col-xl-6 offset-xl-3">

                <WheelBlock
                  items={state.items}
                  title={state.title}
                  selectedIndex={selectedIndex}
                  setSelectedIndex={setSelectedIndex}
                  setSelectedValue={setSelectedValue}
                  setShowResultAlert={setShowResultAlert}
                  hiddenIndices={hiddenIndices}
                  onHiddenIndicesChange={setHiddenIndices}
                  onSpinningChange={setIsSpinning}
                />

                {/* Mobile Controls - сразу под колесом */}
                <div className="d-block d-lg-none controls text-center mt-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ width: '390px', height: '88px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <Controls
                      onReset={handleReset}
                      disabled={visibleItems.length === 0}
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div id="sidebar" className="col-12 mt-xl-0 flex-column col-xl-3 d-flex">
                <SidebarList
                  items={state.items}
                  onItemsChange={handleItemsChange}
                  selectedIndex={selectedIndex}
                  disabled={isSpinning}
                  onEditTitle={handleEditTitle}
                  onEditList={() => {}}
                  hiddenIndices={hiddenIndices}
                  onHiddenIndicesChange={setHiddenIndices}
                  forceEditMode={forceEditMode}
                  forceHideMode={forceHideMode}
                  onCategorySelect={handleCategorySelect}
                  onHideModeChange={handleHideModeChange}
                  isSpinning={isSpinning}
                />
              </div>
            </div>
          </div>

          {/* No items warning */}
          {visibleItems.length === 0 && (
            <div className="col-12 text-center clearfix">
              <div style={{
                marginTop: '20px',
                padding: '12px 16px',
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '4px',
                color: '#856404',
              }}>
                <p style={{ margin: 0, fontWeight: 500 }}>
                  Пожалуйста, войдите в список
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Row with Ads and Description */}
        <div className="row">
          {/* Bottom Ads */}
          <div id="bottom-ads" className="col-12">
            <style>
              {`@media (min-width:0px){.ads-auto.idx-2{display:block;width:300px;min-height:250px;}}
              @media (min-width:768px){.ads-auto.idx-2{display:block;width:728px;min-height:90px;}}
              .ads-auto.idx-2.hide{display:none;}
              @media (min-width:300px) and (max-width:480px) and (orientation: portrait){
              .ads-auto.idx-2{display:flex;justify-content:center;align-items:center;min-width:100vw;min-height:calc(100vw/300*250);}}`}
            </style>
            <div id="dfp-2" className="ads ads-auto idx-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '10px', marginLeft: 'auto', marginRight: 'auto' }}>
              <span style={{ fontSize: '14px', color: '#666', textAlign: 'center', display: 'block', width: '100%' }}>
                Объявления закрыто <span style={{ fontFamily: 'Product Sans, Arial, sans-serif', fontWeight: 500 }}>Google</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="col-12 col-xl-6 offset-xl-3 col-md-8 offset-md-2 offset-xl-0" id="desc" style={{ marginBottom: '16px' }}>
            <p style={{ marginBottom: '1rem' }}>
              Это онлайн-инструмент для случайного выбора названия или предмета.Его также называют выборщиком случайных имен, колесом имён или онлайн-рулеткой.Иногда людям сложно принимать решения. Затем составьте список существующих вариантов или кандидатов, а затем случайным образом выберите один из них. В этом случае вы можете использовать наш инструмент для принятия решений. Просто и весело.Вы можете изменить имена в текстовом поле, поместив одно имя в строку.Имена будут нарисованы по кругу.Просто щелкните круговое колесо, оно начнет вращаться в течение нескольких секунд. В результате случайным образом выбирается одно из имен в списке.Мы также предоставляем удобные сочетания клавиш, если вы используете рабочий стол.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              Что происходит, когда вы начинаете вращаться (щелкаете)?Программа на этой странице сгенерирует действительно случайное число с помощью собственного javascript api и вычислит это число, чтобы указать на одно из имен.Затем круговое колесо начинает вращаться с использованием метода CSS3-2D.
            </p>
            <p id="related" className="related">
              <Link className="active" to="/random/wheel/wheel" style={{ color: '#000' }}>Колесо По Умолчанию</Link>
              <Link to="/random/wheel/yes-no/" style={{ color: '#007bff' }}>Да/Нет</Link>
              <Link to="/random/wheel/cities/" style={{ color: '#007bff' }}>Города</Link>
              <Link to="/random/wheel/animals/" style={{ color: '#007bff' }}>Животные</Link>
              <Link to="/random/wheel/emoji-smileys/" style={{ color: '#007bff' }}>Смайлики</Link>
              <Link to="/random/wheel/meals/" style={{ color: '#007bff' }}>Выбор еды</Link>
              <Link to="/random/wheel/meats/" style={{ color: '#007bff' }}>Мясо</Link>
              <Link to="/random/wheel/fruits/" style={{ color: '#007bff' }}>Фрукты</Link>
              <Link to="/random/wheel/vegetables/" style={{ color: '#007bff' }}>Овощи</Link>
              <Link to="/random/wheel/desserts/" style={{ color: '#007bff' }}>Десерты</Link>
              <Link to="/random/wheel/activities/" style={{ color: '#007bff' }}>Активности</Link>
              <Link to="/random/wheel/friends-activities/" style={{ color: '#007bff' }}>Активности с друзьями</Link>
              <Link to="/random/wheel/movie-genre/" style={{ color: '#007bff' }}>Жанр фильма</Link>
              <Link to="/random/wheel/charades-pictionary/" style={{ color: '#007bff' }}>Шарады / Пиктограмма</Link>
              <Link to="/random/wheel/would-you-rather/" style={{ color: '#007bff' }}>Что бы ты предпочел?</Link>
              <Link to="/random/wheel/never-have-i-ever/" style={{ color: '#007bff' }}>Я никогда не...</Link>
              <Link to="/random/wheel/two-truths-and-a-lie/" style={{ color: '#007bff' }}>Две правды и ложь</Link>
              <Link to="/random/wheel/categories/" style={{ color: '#007bff' }}>Категории</Link>
              <Link to="/random/wheel/name-that-tune/" style={{ color: '#007bff' }}>Угадай мелодию</Link>
              <Link to="/random/wheel/scavenger-hunt/" style={{ color: '#007bff' }}>Охота за сокровищами</Link>
            </p>
          </div>

          <div className="d-none d-xl-block col-xl-3"></div>
        </div>
      </div>

      {/* Footer */}
      <Footer onCategorySelect={handleCategorySelect} />
    </>
  );
}

export default App;
