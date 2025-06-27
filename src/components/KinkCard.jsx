import React from 'react';
import { kinkLevels } from '../data/kinkLevels';
import { categoryIcons } from '../data/kinkLevels';

const KinkCard = ({ category, level = 'soft', isSelected, onSelect, isDisabled }) => {
  const levelStyle = kinkLevels[level];

  return (
    <div
      className={`
        relative group cursor-pointer
        w-[280px] aspect-[16/9]
        rounded-xl overflow-hidden
        transition-all duration-300 ease-in-out
        transform hover:scale-[1.05] hover:-translate-y-1
        ${levelStyle.gradient}
        ${isSelected ? levelStyle.border + ' border-2' : 'border border-transparent'}
        ${levelStyle.hoverBorder}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-amber-900/30'}
      `}
      onClick={() => !isDisabled && onSelect(category.id)}
    >
      {/* Fond avec icône géante */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <span className="text-[120px] text-amber-200/30">
          {categoryIcons[category.id]}
        </span>
      </div>

      {/* Overlay dégradé permanent */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Badge de niveau */}
      <div className={`
        absolute top-3 right-3
        px-2.5 py-1 rounded-full
        text-sm font-medium
        bg-black/40 backdrop-blur-sm
        ${levelStyle.border}
        transition-all duration-300
        group-hover:scale-110
      `}>
        {levelStyle.emoji}
      </div>

      {/* Contenu principal */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* Titre et infos */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-amber-100 drop-shadow-lg">
            {category.name}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-amber-200/90">
            <span>{categoryIcons[category.id]}</span>
            <span>•</span>
            <span>{category.subcategories.length} options</span>
          </div>
        </div>

        {/* Indicateur de sélection */}
        {isSelected && (
          <div className="absolute top-4 left-4 bg-amber-500/80 rounded-full p-2
            transform -rotate-12 shadow-lg">
            <svg className="w-6 h-6 text-amber-100" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Overlay au survol */}
      <div className={`
        absolute inset-0
        bg-gradient-to-t from-amber-900/60 to-transparent
        opacity-0 group-hover:opacity-100
        transition-opacity duration-300
      `} />
    </div>
  );
};

export default KinkCard;
