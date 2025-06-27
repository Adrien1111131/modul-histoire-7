import React from 'react';
import { kinkLevels, kinkPacks } from '../data/kinkLevels';
import kinkCategories from '../data/kinkCategories';

const KinkPack = ({ pack, onSelect, isSelected }) => {
  const levelStyle = kinkLevels[pack.level];
  
  // Récupérer les catégories du pack
  const packCategories = pack.categories.map(id => 
    kinkCategories.find(cat => cat.id === id)
  );

  return (
    <div
      className={`
        relative cursor-pointer
        p-4 rounded-xl
        transition-all duration-300
        ${levelStyle.gradient}
        ${isSelected ? levelStyle.border + ' border-2' : 'border border-transparent'}
        ${levelStyle.hoverBorder}
        hover:shadow-lg hover:shadow-amber-900/20
      `}
      onClick={() => onSelect(pack.id)}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{pack.emoji}</span>
          <h3 className="text-lg font-medium text-amber-100">
            {pack.name}
          </h3>
        </div>
        <div className={`
          px-2 py-0.5 rounded-full
          text-xs font-medium
          bg-black/20 backdrop-blur-sm
          ${levelStyle.border}
        `}>
          {levelStyle.emoji}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-amber-200/70 mb-3">
        {pack.description}
      </p>

      {/* Liste des catégories */}
      <div className="space-y-1">
        {packCategories.map(category => (
          <div 
            key={category.id}
            className="flex items-center text-sm text-amber-100/80"
          >
            <span className="w-5 text-center mr-1">•</span>
            {category.name}
          </div>
        ))}
      </div>

      {/* Indicateur de sélection */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-amber-500/30 rounded-full p-1">
          <svg className="w-4 h-4 text-amber-200" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Overlay au survol */}
      <div className={`
        absolute inset-0 rounded-xl
        bg-gradient-to-t from-black/40 to-transparent
        opacity-0 hover:opacity-100
        transition-opacity duration-300
      `} />
    </div>
  );
};

export default KinkPack;
