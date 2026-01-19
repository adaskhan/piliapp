import { useEffect, useRef, useState } from 'react';
import { categories } from '../data/categories';

interface SidebarListProps {
  items: string[];
  onItemsChange: (items: string[]) => void;
  selectedIndex?: number;
  disabled?: boolean;
  onEditTitle?: () => void;
  onEditList?: () => void;
  hiddenIndices?: number[];
  onHiddenIndicesChange?: (indices: number[]) => void;
  forceEditMode?: boolean;
  forceHideMode?: boolean;
  onCategorySelect?: (items: string[], categoryName: string) => void;
  onHideModeChange?: (isHiding: boolean) => void;
  isSpinning?: boolean;
  spinMode?: 'random' | 'selected';
  onWinnerSelect?: (index: number | null) => void;
  selectedWinnerIndex?: number | null;
}

export function SidebarList({
  items,
  onItemsChange,
  selectedIndex,
  disabled,
  onEditTitle,
  hiddenIndices = [],
  onHiddenIndicesChange,
  forceEditMode = false,
  forceHideMode = false,
  onCategorySelect,
  onHideModeChange,
  isSpinning = false,
  spinMode = 'random',
  onWinnerSelect,
  selectedWinnerIndex,
}: SidebarListProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isExternalUpdateRef = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHidingMode, setIsHidingMode] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [textareaValue, setTextareaValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setTextareaValue(newValue);

    // Mark that this is not an external update
    isExternalUpdateRef.current = false;

    // Auto-apply changes to wheel immediately
    const lines = newValue.split('\n').filter(line => line.trim() !== '');
    if (lines.length > 100) {
      alert('В списке слишком много элементов. Не может превышать 100 элементов.');
      return;
    }
    onItemsChange(lines);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter works normally for new line
  };

  const handleEditClick = () => {
    setTextareaValue(items.join('\n'));
    setIsEditing(true);
    setIsHidingMode(false);
    setIsSelectMode(false);
    // Focus textarea after a small delay to ensure it's rendered
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleFinish = () => {
    // Just exit editing mode - changes are already applied in real-time via handleChange
    setIsEditing(false);
    setIsHidingMode(false);
    setIsSelectMode(false);
  };

  const handleToggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
  };

  const handleHideMode = () => {
    setIsHidingMode(true);
    setIsEditing(false);
    setIsSelectMode(false);
  };

  const handleResetHidden = () => {
    onHiddenIndicesChange?.([]);
  };

  const handleTextareaClick = () => {
    if (!isEditing) {
      setTextareaValue(items.join('\n'));
      setIsEditing(true);
      setIsHidingMode(false);
      setIsSelectMode(false);
    }
  };

  const handleCategoryClick = (categoryItems: string[], categoryName: string) => {
    setSelectedCategory(categoryName);
    isExternalUpdateRef.current = true;
    onCategorySelect?.(categoryItems, categoryName);
  };

  // Sync isEditing with forceEditMode
  useEffect(() => {
    if (forceEditMode) {
      setIsEditing(true);
      setIsHidingMode(false);
      setIsSelectMode(false);
    }
  }, [forceEditMode]);

  // Sync isHidingMode with forceHideMode
  useEffect(() => {
    if (forceHideMode) {
      setIsHidingMode(true);
      setIsEditing(false);
      setIsSelectMode(false);
    }
  }, [forceHideMode]);

  // Notify parent when hide mode changes
  useEffect(() => {
    onHideModeChange?.(isHidingMode);
  }, [isHidingMode, onHideModeChange]);

  // Detect current category when editing starts
  useEffect(() => {
    if (isEditing) {
      // Find matching category by comparing items
      const matchingCategory = categories.find(category => {
        return category.items.length === items.length &&
          category.items.every((item, index) => item === items[index]);
      });
      if (matchingCategory) {
        setSelectedCategory(matchingCategory.name);
      }
    }
  }, [isEditing, items]);

  // Update textarea value when items change externally (e.g., category selection)
  useEffect(() => {
    if (isExternalUpdateRef.current) {
      setTextareaValue(items.join('\n'));
      isExternalUpdateRef.current = false;
    }
  }, [items]);

  const hasHiddenItems = hiddenIndices.length > 0;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Textarea for editing - hidden by default */}
      <textarea
        ref={textareaRef}
        id="names"
        placeholder="Пожалуйста, введите здесь имена людей и отделите их другой строкой."
        className="names"
        style={{
          display: isEditing && !isSelectMode ? 'block' : 'none',
          width: '310px',
          height: '384.39px',
        }}
        value={textareaValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoFocus={isEditing && !isSelectMode}
      />

      {/* Names show - displayed when not editing */}
      <div
        id="names-show"
        className="names"
        style={{ display: !isEditing && !isHidingMode ? 'block' : 'none' }}
        onClick={spinMode === 'random' ? handleEditClick : undefined}
      >
        {items.map((item, index) => {
          const isHidden = hiddenIndices.includes(index);

          return (
            <div key={index} className={isHidden ? 'strike' : ''}>
              {item}
            </div>
          );
        })}
      </div>

      {/* Names select - for selecting winner (inside editing mode) */}
      <div
        id="names-select"
        className="names"
        style={{ display: isEditing && isSelectMode ? 'block' : 'none' }}
      >
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', textAlign: 'center' }}>
          Нажмите на элемент чтобы выбрать его для режима S
        </div>
        {items.map((item, index) => {
          const isHidden = hiddenIndices.includes(index);
          return (
            <div
              key={index}
              className={isHidden ? 'strike' : ''}
              style={{
                cursor: isHidden ? 'default' : 'pointer',
                padding: '2px 4px',
                borderRadius: '3px',
              }}
              onClick={() => {
                if (!isHidden) {
                  onWinnerSelect?.(index);
                  setIsSelectMode(false);
                }
              }}
            >
              {item}
            </div>
          );
        })}
      </div>

      {/* Names strike - for hiding mode */}
      <div
        id="names-strike"
        className="names"
        style={{ display: isHidingMode ? 'block' : 'none' }}
      >
        {items.map((item, index) => {
          const isHidden = hiddenIndices.includes(index);
          return (
            <div key={index}>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={isHidden}
                    onChange={(e) => {
                      const newHidden = e.target.checked
                        ? [...hiddenIndices, index]
                        : hiddenIndices.filter(i => i !== index);
                      onHiddenIndicesChange?.(newHidden);
                    }}
                  />{' '}
                  <span className={isHidden ? 'strike' : ''}>{item}</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit bar */}
      {!isSpinning && (
      <div id="edit-bar" style={{ visibility: 'visible', marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {!isEditing && !isHidingMode && !isSelectMode && (
          <>
            <button
              id="edit-title"
              title="изменить заголовок"
              className="btn btn-outline-secondary btn-sm"
              onClick={onEditTitle}
              style={{ width: '83.83px', height: '31px' }}
            >
              Заголовок
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleEditClick}
              disabled={disabled}
              style={{ width: '81.16px', height: '31px' }}
            >
              Изменить
            </button>
          </>
        )}
        {isEditing && (
          <>
            {spinMode === 'selected' && (
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={handleToggleSelectMode}
                style={{ width: '80px', height: '31px' }}
              >
                {isSelectMode ? '← Назад' : 'Выбрать'}
              </button>
            )}
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleFinish}
              style={{ width: '89.11px', height: '31px' }}
            >
              Закончить
            </button>
          </>
        )}
        {isHidingMode && (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleFinish}
            style={{ width: '89.11px', height: '31px' }}
          >
            Закончить
          </button>
        )}
        {!isEditing && !isHidingMode && !isSelectMode && (
          <button
            title="редактировать скрытые элементы в списке"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleHideMode}
            disabled={disabled}
            style={{ width: '89.11px', height: '31px' }}
          >
            скрывать...
          </button>
        )}
        {hasHiddenItems && !isEditing && !isHidingMode && !isSelectMode && (
          <button
            id="strike-reset"
            title="показать все скрытые предметы"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleResetHidden}
            disabled={disabled}
            style={{ width: '81.16px', height: '31px' }}
          >
            Сбросить
          </button>
        )}
      </div>
      )}

      {/* Divider line when editing */}
      {isEditing && (
        <div className="edit-divider" style={{
          marginTop: '10px',
          marginBottom: '10px',
          borderBottom: '1px solid #ccc'
        }} />
      )}

      {/* Categories when editing */}
      {isEditing && !isHidingMode && (
        <div className="d-none d-xl-block">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryClick(category.items, category.name)}
              style={{
                margin: '.2em .6em',
                padding: '0 .5em',
                border: 'solid 1px #000',
                display: 'inline-block',
                color: selectedCategory === category.name ? '#000' : '#007bff',
                textDecoration: 'none',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                fontSize: 'inherit',
                height: '26px',
                lineHeight: '26px',
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.name) {
                  e.currentTarget.style.color = '#0056b3';
                  e.currentTarget.style.textDecoration = 'underline';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.name) {
                  e.currentTarget.style.color = '#007bff';
                  e.currentTarget.style.textDecoration = 'none';
                }
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Hotkeys - desktop only, hide when editing or spinning */}
      {!isEditing && !isSpinning && (
        <div className="d-none d-xl-block">
          <div id="shortcut">
            <div><span className="key">SPACE</span> покрутите</div>
            <div><span className="key">X</span> закрыть баннер</div>
            <div><span className="key">S</span> скрыть выбранный элемент</div>
            <div><span className="key">R</span> Сбросить</div>
            <div><span className="key">E</span> Изменить</div>
            <div><span className="key">F</span> Во весь экран</div>
          </div>
        </div>
      )}
    </div>
  );
}

