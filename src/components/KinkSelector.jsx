import React, { useState, useEffect } from 'react';
import kinkCategories from '../data/kinkCategories';
import { kinkLevels } from '../data/kinkLevels';
import KinkAccordion from './KinkAccordion';
import profileService from '../services/profileService';

const KinkSelector = ({ selectedKinks, setSelectedKinks, onSubmit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(kinkCategories);
  const [selectedLevel, setSelectedLevel] = useState('soft');
  const [expandedCategories, setExpandedCategories] = useState([]);
  const maxSelections = 5;

  // Filtrer les catégories par niveau et terme de recherche
  const getFilteredCategories = () => {
    let filtered = kinkCategories;
    
    // Filtrer par niveau sélectionné
    filtered = filtered.filter(category => category.level === selectedLevel);
    
    // Filtrer par terme de recherche si présent
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.subcategories.some(subcat => 
          subcat.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    return filtered;
  };

  // Filtrer les catégories en fonction du terme de recherche
  useEffect(() => {
    // Filtrer d'abord par niveau
    let filtered = kinkCategories.filter(category => category.level === selectedLevel);
    
    // Puis par terme de recherche si présent
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.subcategories.some(subcat => 
          subcat.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      
      // Ouvrir automatiquement les catégories qui contiennent des résultats de recherche
      const categoriesToExpand = filtered.map(cat => cat.id);
      setExpandedCategories(categoriesToExpand);
    }
    
    setFilteredCategories(filtered);
  }, [searchTerm, selectedLevel]);

  // Gérer la sélection/désélection d'une sous-catégorie
  const handleKinkToggle = (kink) => {
    if (selectedKinks.includes(kink)) {
      setSelectedKinks(selectedKinks.filter(k => k !== kink));
    } else {
      if (selectedKinks.length < maxSelections) {
        setSelectedKinks([...selectedKinks, kink]);
      }
    }
  };

  // Gérer l'expansion/réduction d'une catégorie
  const toggleCategory = (categoryId) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  // Gérer la modification du terme de recherche
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-black/40 backdrop-blur-sm p-6">
      {/* En-tête */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-amber-200">
              {selectedKinks.length}/{maxSelections} sélectionnés
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-4 py-2 w-64 bg-amber-200/10 border border-amber-300/30 rounded-full text-white placeholder-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
            />
          </div>
        </div>

        {/* Sélecteur de niveau */}
        <div className="flex justify-center space-x-4">
          {Object.entries(kinkLevels).map(([key, level]) => (
            <button
              key={key}
              onClick={() => setSelectedLevel(key)}
              className={`
                px-6 py-3 rounded-xl
                transition-all duration-300
                ${level.gradient}
                ${selectedLevel === key ? level.border + ' border-2' : 'border border-transparent'}
                ${level.hoverBorder}
                flex items-center space-x-2
              `}
            >
              <span className="text-2xl">{level.emoji}</span>
              <span className="text-lg text-amber-100">{level.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Liste des catégories */}
      <div className="max-w-4xl mx-auto pb-64">
        {getFilteredCategories().map(category => (
          <KinkAccordion
            key={category.id}
            category={category}
            selectedKinks={selectedKinks}
            onKinkToggle={handleKinkToggle}
            level={selectedLevel}
          />
        ))}
      </div>

      {/* Barre de sélections */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-grow">
              <h3 className="text-lg font-medium text-amber-200 whitespace-nowrap">Sélections :</h3>
              <div className="flex flex-wrap gap-2">
                {selectedKinks.map(kink => (
                  <span 
                    key={kink} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-500/30 text-amber-100"
                  >
                    {kink}
                    <button 
                      type="button"
                      onClick={() => handleKinkToggle(kink)}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-amber-300 hover:bg-amber-600/50 hover:text-amber-100 focus:outline-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default KinkSelector;
