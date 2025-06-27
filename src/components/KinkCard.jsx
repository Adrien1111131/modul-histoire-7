import React from 'react';
import { kinkLevels } from '../data/kinkLevels';
import { categoryIcons } from '../data/kinkLevels';

const KinkCard = ({ category, level = 'soft', isSelected, onSelect, isDisabled }) => {
  const levelStyle = kinkLevels[level];

  return (
    <div
      className={`
        relative group cursor-pointer
        w-full max-w-[180px] aspect-[1/1.2]
        rounded-xl overflow-hidden
        transition-all duration-300 ease-in-out
        transform hover:scale-[1.02]
        ${levelStyle.gradient}
        ${isSelected ? levelStyle.border + ' border-2' : 'border border-transparent'}
        ${levelStyle.hoverBorder}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-amber-900/20'}
      `}
      onClick={() => !isDisabled && onSelect(category.id)}
    >
      {/* Badge de niveau */}
      <div className={`
        absolute top-2 right-2
        px-2 py-0.5 rounded-full
        text-xs font-medium
        bg-black/20 backdrop-blur-sm
        ${levelStyle.border}
      `}>
        {levelStyle.emoji} {levelStyle.label}
      </div>

      {/* Contenu principal */}
      <div className="p-4 h-full flex flex-col">
        {/* Icône et nom */}
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-2">{categoryIcons[category.id]}</span>
          <h3 className="text-lg font-medium text-amber-100 line-clamp-2">
            {category.name}
          </h3>
        </div>

        {/* Nombre de sous-catégories */}
        <div className="text-sm text-amber-200/70 mb-2">
          {category.subcategories.length} options
        </div>

        {/* Indicateur de sélection */}
        {isSelected && (
          <div className="absolute bottom-2 right-2 bg-amber-500/30 rounded-full p-1">
            <svg className="w-4 h-4 text-amber-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Overlay au survol */}
        <div className={`
          absolute inset-0
          bg-gradient-to-t from-black/40 to-transparent
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
        `} />
      </div>
    </div>
  );
};

export default KinkCard;
