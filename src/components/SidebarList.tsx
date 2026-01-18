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
}: SidebarListProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isExternalUpdateRef = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHidingMode, setIsHidingMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [textareaValue, setTextareaValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setTextareaValue(newValue);

    // Mark that this is not an external update
    isExternalUpdateRef.current = false;

    // Auto-apply changes to wheel
    const lines = newValue.split('\n').filter(line => line.trim() !== '');
    if (lines.length > 100) {
      alert('В списке слишком много элементов. Не может превышать 100 элементов.');
      return;
    }
    onItemsChange(lines);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Shift+Enter for new line, Enter applies changes
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newValue = textareaValue + '\n';
      setTextareaValue(newValue);
      const lines = newValue.split('\n').filter(line => line.trim() !== '');
      if (lines.length > 100) {
        alert('В списке слишком много элементов. Не может превышать 100 элементов.');
        return;
      }
      onItemsChange(lines);
    }
  };

  const handleEditClick = () => {
    setTextareaValue(items.join('\n'));
    setIsEditing(true);
    setIsHidingMode(false);
  };

  const handleFinish = () => {
    // Apply changes when finishing editing
    const lines = textareaValue.split('\n').filter(line => line.trim() !== '');
    if (lines.length > 100) {
      alert('В списке слишком много элементов. Не может превышать 100 элементов.');
      return;
    }
    onItemsChange(lines);
    setIsEditing(false);
    setIsHidingMode(false);
  };

  const handleHideMode = () => {
    setIsHidingMode(true);
    setIsEditing(false);
  };

  const handleResetHidden = () => {
    onHiddenIndicesChange?.([]);
  };

  const handleTextareaClick = () => {
    if (!isEditing) {
      setTextareaValue(items.join('\n'));
      setIsEditing(true);
      setIsHidingMode(false);
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
    }
  }, [forceEditMode]);

  // Sync isHidingMode with forceHideMode
  useEffect(() => {
    if (forceHideMode) {
      setIsHidingMode(true);
      setIsEditing(false);
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
          display: isEditing && !isHidingMode ? 'block' : 'none',
          width: '310px',
          height: '384.39px',
        }}
        value={textareaValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />

      {/* Names show - displayed when not editing */}
      <div
        id="names-show"
        className="names"
        style={{ display: !isEditing && !isHidingMode ? 'block' : 'none' }}
        onClick={handleEditClick}
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
        {!isEditing && (
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
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleFinish}
            style={{ width: '89.11px', height: '31px' }}
          >
            Закончить
          </button>
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
        {!isEditing && !isHidingMode && (
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
        {hasHiddenItems && !isEditing && (
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
