import React, { useState, useEffect } from 'react';
import kinkCategories from '../data/kinkCategories';
import { kinkLevels } from '../data/kinkLevels';
import KinkAccordion from './KinkAccordion';

const KinkSelector = ({ selectedKinks, setSelectedKinks }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(kinkCategories);
  const [selectedPack, setSelectedPack] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('soft');
  const maxSelections = 5;

  // Filtrer les catégories par niveau et terme de recherche
  const getFilteredCategories = () => {
    let filtered = kinkCategories;
    
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

  // Sélectionner un pack
  const handlePackSelect = (packId) => {
    const pack = kinkPacks.find(p => p.id === packId);
    if (pack) {
      setSelectedPack(pack);
      setSelectedKinks(pack.categories.flatMap(catId => {
        const category = kinkCategories.find(c => c.id === catId);
        return category ? [category.name] : [];
      }));
    }
  };

  // Filtrer les catégories en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCategories(kinkCategories);
    } else {
      const filtered = kinkCategories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.subcategories.some(subcat => 
          subcat.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredCategories(filtered);
      
      // Ouvrir automatiquement les catégories qui contiennent des résultats de recherche
      const categoriesToExpand = filtered.map(cat => cat.id);
      setExpandedCategories(categoriesToExpand);
    }
  }, [searchTerm]);

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-amber-100">
            Sélectionnez vos fantasmes
          </h2>
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
      <div className="max-w-4xl mx-auto">
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

      {/* Sélections actuelles */}
      {selectedKinks.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-amber-200">Sélections :</h3>
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
      )}
    </div>
  );
};

export default KinkSelector;
