import React, { useState, useEffect } from 'react';
import kinkCategories from '../data/kinkCategories';
import { kinkLevels, kinkPacks } from '../data/kinkLevels';
import KinkCard from './KinkCard';
import KinkPack from './KinkPack';

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
    <div className="space-y-8">
      {/* En-tête et recherche */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium text-amber-100">
            Sélectionnez vos fantasmes
          </h2>
          <div className="text-sm text-amber-200">
            {selectedKinks.length}/{maxSelections} sélectionnés
          </div>
        </div>

        <input
          type="text"
          placeholder="Rechercher une catégorie..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 bg-amber-200/30 border border-amber-300/50 rounded-md text-white placeholder-amber-200/70 focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
      </div>

      {/* Sélecteur de niveau */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-amber-200">Niveau d'intensité</h3>
        <div className="flex space-x-4">
          {Object.entries(kinkLevels).map(([key, level]) => (
            <button
              key={key}
              onClick={() => setSelectedLevel(key)}
              className={`
                px-4 py-2 rounded-lg
                transition-all duration-300
                ${level.gradient}
                ${selectedLevel === key ? level.border + ' border-2' : 'border border-transparent'}
                ${level.hoverBorder}
              `}
            >
              <span className="text-lg mr-2">{level.emoji}</span>
              <span className="text-amber-100">{level.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Packs thématiques */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-amber-200">Packs thématiques</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kinkPacks.map(pack => (
            <KinkPack
              key={pack.id}
              pack={pack}
              isSelected={selectedPack?.id === pack.id}
              onSelect={handlePackSelect}
            />
          ))}
        </div>
      </div>

      {/* Catégories individuelles */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-amber-200">Toutes les catégories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {getFilteredCategories().map(category => (
            <KinkCard
              key={category.id}
              category={category}
              level={selectedLevel}
              isSelected={selectedKinks.includes(category.name)}
              onSelect={() => handleKinkToggle(category.name)}
              isDisabled={selectedKinks.length >= maxSelections && !selectedKinks.includes(category.name)}
            />
          ))}
        </div>
      </div>

      {/* Sélections actuelles */}
      {selectedKinks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-amber-200">Sélections actuelles</h3>
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
      )}
    </div>
  );
};

export default KinkSelector;
