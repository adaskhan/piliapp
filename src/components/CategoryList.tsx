import { categories } from '../data/categories';

interface CategoryListProps {
  onCategorySelect?: (items: string[], categoryName: string) => void;
}

export function CategoryList({ onCategorySelect }: CategoryListProps) {
  const handleCategoryClick = (items: string[], categoryName: string) => {
    onCategorySelect?.(items, categoryName);
  };

  return (
    <div className="pili-categories-panel">
      <div className="pili-categories-title">Стандартный</div>
      <div className="pili-categories-buttons">
        {categories.map((category) => (
          <button
            key={category.name}
            className="pili-category-btn"
            onClick={() => handleCategoryClick(category.items, category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
