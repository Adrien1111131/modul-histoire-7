import React, { useRef } from 'react';
import KinkCard from './KinkCard';

const KinkRow = ({ title, categories, selectedKinks, onKinkToggle, level }) => {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    const scrollAmount = 300;
    if (rowRef.current) {
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative py-4">
      {/* Titre de la rangée */}
      <h3 className="text-xl font-medium text-amber-100 mb-4 px-4">
        {title}
      </h3>

      {/* Conteneur avec défilement horizontal */}
      <div className="relative group">
        {/* Bouton gauche */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10
            w-12 h-24 flex items-center justify-center
            bg-black/30 backdrop-blur-sm
            text-white/70 hover:text-white
            transition-all duration-300
            opacity-0 group-hover:opacity-100
            focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Liste défilante */}
        <div
          ref={rowRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide px-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {categories.map(category => (
            <div key={category.id} className="flex-none">
              <KinkCard
                category={category}
                level={level}
                isSelected={selectedKinks.includes(category.name)}
                onSelect={() => onKinkToggle(category.name)}
                isDisabled={selectedKinks.length >= 5 && !selectedKinks.includes(category.name)}
              />
            </div>
          ))}
        </div>

        {/* Bouton droit */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10
            w-12 h-24 flex items-center justify-center
            bg-black/30 backdrop-blur-sm
            text-white/70 hover:text-white
            transition-all duration-300
            opacity-0 group-hover:opacity-100
            focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default KinkRow;
