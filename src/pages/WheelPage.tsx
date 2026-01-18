import { useParams, Link } from 'react-router-dom';
import { getCategoryBySlug } from '../data/categories';
import { useState, useCallback, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import WheelBlock from '../components/WheelBlock';
import { SidebarList } from '../components/SidebarList';
import { Controls } from '../components/Controls';
import { ResultAlert } from '../components/ResultAlert';
import { Footer } from '../components/Footer';
import { useHotkeys } from '../hooks/useHotkeys';
import { getColor } from '../utils/wheelColors';
import type { HotkeyAction } from '../types';
import '../styles/piliapp.css';

export function WheelPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = getCategoryBySlug(slug || '');

  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const [selectedValue, setSelectedValue] = useState<string | undefined>();
  const [showResultAlert, setShowResultAlert] = useState(false);
  const [hiddenIndices, setHiddenIndices] = useState<number[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [editableItems, setEditableItems] = useState<string[]>(category?.items || []);

  // Update editableItems when category changes
  useEffect(() => {
    if (category?.items) {
      setEditableItems(category.items);
    }
  }, [category]);

  const items = editableItems;
  const title = category?.heading || category?.name || 'Колесо';

  const handleCloseResultAlert = useCallback(() => {
    setShowResultAlert(false);
  }, []);

  const handleHideSelected = useCallback(() => {
    if (selectedValue !== undefined && items.length > 1) {
      const originalIndex = items.findIndex(item => item === selectedValue);
      if (originalIndex !== -1) {
        setHiddenIndices([...hiddenIndices, originalIndex]);
      }
      setSelectedIndex(undefined);
      setSelectedValue(undefined);
      setShowResultAlert(false);
    }
  }, [selectedValue, hiddenIndices, items]);

  const visibleItems = items.filter((_, i) => !hiddenIndices.includes(i));

  const handleReset = useCallback(() => {
    setShowResultAlert(false);
    setSelectedIndex(undefined);
    setSelectedValue(undefined);
    setHiddenIndices([]);
    if (category?.items) {
      setEditableItems(category.items);
    }
  }, [category]);

  const handleCategorySelect = useCallback((items: string[], categoryName: string) => {
    setEditableItems(items);
    setSelectedIndex(undefined);
    setSelectedValue(undefined);
    setShowResultAlert(false);
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
        } else if (selectedIndex !== undefined && items.length > 1) {
          const currentVisibleItems = items.filter((_, i) => !hiddenIndices.includes(i));
          const selectedValue = currentVisibleItems[selectedIndex];
          if (selectedValue) {
            const originalIndex = items.findIndex(item => item === selectedValue);
            if (originalIndex !== -1) {
              setHiddenIndices([...hiddenIndices, originalIndex]);
            }
          }
          setSelectedIndex(undefined);
        }
        break;
      case 'reset':
        if (window.confirm('Вы хотите сбросить настройки?')) {
          handleReset();
        }
        break;
      case 'edit':
        setShowResultAlert(false);
        break;
      case 'fullscreen':
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
        break;
    }
  }, [selectedIndex, items, handleReset, showResultAlert, handleCloseResultAlert, handleHideSelected, hiddenIndices]);

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
                  <h1>{title}</h1>
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
                  items={items}
                  title={title}
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
                  <div style={{ width: '390px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ height: '88px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <Controls
                          onReset={handleReset}
                          disabled={visibleItems.length === 0}
                        />
                      </div>
                      {showResultAlert && selectedValue && (
                        <div id="hide-result-wrapper" style={{ visibility: 'visible', marginTop: '0' }}>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={handleHideSelected}
                          >
                            скрыть <b>{selectedValue}</b>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div id="sidebar" className="col-12 mt-xl-0 flex-column col-xl-3 d-flex">
                <SidebarList
                  items={items}
                  onItemsChange={setEditableItems}
                  selectedIndex={selectedIndex}
                  disabled={isSpinning}
                  onEditTitle={() => {}}
                  onEditList={() => {}}
                  hiddenIndices={hiddenIndices}
                  onHiddenIndicesChange={setHiddenIndices}
                  forceEditMode={false}
                  forceHideMode={false}
                  onCategorySelect={handleCategorySelect}
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
              {category?.description || 'Это онлайн-инструмент для случайного выбора названия или предмета. Его также называют выборщиком случайных имен, колесом имён или онлайн-рулеткой. Иногда людям сложно принимать решения. Затем составьте список существующих вариантов или кандидатов, а затем случайным образом выберите один из них. В этом случае вы можете использовать наш инструмент для принятия решений. Просто и весело. Вы можете изменить имена в текстовом поле, поместив одно имя в строку. Имена будут нарисованы по кругу. Просто щелкните круговое колесо, оно начнет вращаться в течение нескольких секунд. В результате случайным образом выбирается одно из имен в списке. Мы также предоставляем удобные сочетания клавиш, если вы используете рабочий стол.'}
            </p>
            {slug === 'wheel' && (
              <p style={{ marginBottom: '1rem' }}>
                Что происходит, когда вы начинаете вращаться (щелкаете)? Программа на этой странице сгенерирует действительно случайное число с помощью собственного javascript api и вычислит это число, чтобы указать на одно из имен. Затем круговое колесо начинает вращаться с использованием метода CSS3-2D.
              </p>
            )}
            <p id="related" className="related">
              <Link className={slug === 'wheel' ? 'active' : ''} to="/random/wheel/wheel" style={{ color: slug === 'wheel' ? '#000' : '#007bff' }}>Колесо По Умолчанию</Link>
              <Link className={slug === 'yes-no' ? 'active' : ''} to="/random/wheel/yes-no/" style={{ color: slug === 'yes-no' ? '#000' : '#007bff' }}>Да/Нет</Link>
              <Link className={slug === 'cities' ? 'active' : ''} to="/random/wheel/cities/" style={{ color: slug === 'cities' ? '#000' : '#007bff' }}>Города</Link>
              <Link className={slug === 'animals' ? 'active' : ''} to="/random/wheel/animals/" style={{ color: slug === 'animals' ? '#000' : '#007bff' }}>Животные</Link>
              <Link className={slug === 'emoji-smileys' ? 'active' : ''} to="/random/wheel/emoji-smileys/" style={{ color: slug === 'emoji-smileys' ? '#000' : '#007bff' }}>Смайлики</Link>
              <Link className={slug === 'meals' ? 'active' : ''} to="/random/wheel/meals/" style={{ color: slug === 'meals' ? '#000' : '#007bff' }}>Выбор еды</Link>
              <Link className={slug === 'meats' ? 'active' : ''} to="/random/wheel/meats/" style={{ color: slug === 'meats' ? '#000' : '#007bff' }}>Мясо</Link>
              <Link className={slug === 'fruits' ? 'active' : ''} to="/random/wheel/fruits/" style={{ color: slug === 'fruits' ? '#000' : '#007bff' }}>Фрукты</Link>
              <Link className={slug === 'vegetables' ? 'active' : ''} to="/random/wheel/vegetables/" style={{ color: slug === 'vegetables' ? '#000' : '#007bff' }}>Овощи</Link>
              <Link className={slug === 'desserts' ? 'active' : ''} to="/random/wheel/desserts/" style={{ color: slug === 'desserts' ? '#000' : '#007bff' }}>Десерты</Link>
              <Link className={slug === 'activities' ? 'active' : ''} to="/random/wheel/activities/" style={{ color: slug === 'activities' ? '#000' : '#007bff' }}>Активности</Link>
              <Link className={slug === 'friends-activities' ? 'active' : ''} to="/random/wheel/friends-activities/" style={{ color: slug === 'friends-activities' ? '#000' : '#007bff' }}>Активности с друзьями</Link>
              <Link className={slug === 'movie-genre' ? 'active' : ''} to="/random/wheel/movie-genre/" style={{ color: slug === 'movie-genre' ? '#000' : '#007bff' }}>Жанр фильма</Link>
              <Link className={slug === 'charades-pictionary' ? 'active' : ''} to="/random/wheel/charades-pictionary/" style={{ color: slug === 'charades-pictionary' ? '#000' : '#007bff' }}>Шарады / Пиктограмма</Link>
              <Link className={slug === 'would-you-rather' ? 'active' : ''} to="/random/wheel/would-you-rather/" style={{ color: slug === 'would-you-rather' ? '#000' : '#007bff' }}>Что бы ты предпочел?</Link>
              <Link className={slug === 'never-have-i-ever' ? 'active' : ''} to="/random/wheel/never-have-i-ever/" style={{ color: slug === 'never-have-i-ever' ? '#000' : '#007bff' }}>Я никогда не...</Link>
              <Link className={slug === 'two-truths-and-a-lie' ? 'active' : ''} to="/random/wheel/two-truths-and-a-lie/" style={{ color: slug === 'two-truths-and-a-lie' ? '#000' : '#007bff' }}>Две правды и ложь</Link>
              <Link className={slug === 'categories' ? 'active' : ''} to="/random/wheel/categories/" style={{ color: slug === 'categories' ? '#000' : '#007bff' }}>Категории</Link>
              <Link className={slug === 'name-that-tune' ? 'active' : ''} to="/random/wheel/name-that-tune/" style={{ color: slug === 'name-that-tune' ? '#000' : '#007bff' }}>Угадай мелодию</Link>
              <Link className={slug === 'scavenger-hunt' ? 'active' : ''} to="/random/wheel/scavenger-hunt/" style={{ color: slug === 'scavenger-hunt' ? '#000' : '#007bff' }}>Охота за сокровищами</Link>
            </p>
          </div>

          <div className="d-none d-xl-block col-xl-3"></div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
