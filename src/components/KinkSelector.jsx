import React, { useState, useEffect } from 'react';
import kinkCategories from '../data/kinkCategories';
import { kinkLevels, kinkPacks } from '../data/kinkLevels';
import KinkRow from './KinkRow';
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

  // Grouper les catégories par thème
  const categoryGroups = {
    'Romantique & Sensuel': kinkCategories.filter(cat => 
      ['Dynamiques de pouvoir', 'Jeux de sensation', 'Positions et techniques'].includes(cat.name)
    ),
    'Passionné & Intense': kinkCategories.filter(cat => 
      ['Pratiques physiques', 'Contrôle de l\'orgasme', 'Jeux sexuels spécifiques'].includes(cat.name)
    ),
    'Jeux de Rôle & Scénarios': kinkCategories.filter(cat => 
      ['Jeux de rôle et scénarios', 'Jeux psychologiques et émotionnels'].includes(cat.name)
    ),
    'Lieux & Contextes': kinkCategories.filter(cat => 
      ['Contextes et lieux', 'Dynamiques relationnelles'].includes(cat.name)
    ),
    'Fétichismes & Spécialités': kinkCategories.filter(cat => 
      ['Fétichismes et adoration', 'Transformation et identité'].includes(cat.name)
    )
  };

  return (
    <div className="min-h-screen bg-black/40 backdrop-blur-sm">
      {/* En-tête fixe */}
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-md px-6 py-4">
        <div className="flex items-center justify-between mb-4">
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
              className="px-4 py-2 w-48 bg-amber-200/10 border border-amber-300/30 rounded-full text-white placeholder-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
            />
          </div>
        </div>

        {/* Sélecteur de niveau */}
        <div className="flex space-x-4">
          {Object.entries(kinkLevels).map(([key, level]) => (
            <button
              key={key}
              onClick={() => setSelectedLevel(key)}
              className={`
                px-4 py-2 rounded-full
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

      {/* Contenu principal défilant */}
      <div className="space-y-8 pt-4">
        {/* Packs populaires */}
        <div className="mb-12">
          <KinkRow
            title="🌟 Packs populaires"
            categories={kinkPacks.map(pack => ({
              id: pack.id,
              name: pack.name,
              subcategories: pack.categories.map(id => 
                kinkCategories.find(cat => cat.id === id)?.name || ''
              )
            }))}
            selectedKinks={selectedKinks}
            onKinkToggle={handleKinkToggle}
            level={selectedLevel}
          />
        </div>

        {/* Rangées par thème */}
        {Object.entries(categoryGroups).map(([title, categories]) => (
          <KinkRow
            key={title}
            title={title}
            categories={categories}
            selectedKinks={selectedKinks}
            onKinkToggle={handleKinkToggle}
            level={selectedLevel}
          />
        ))}

        {/* Sélections actuelles */}
        {selectedKinks.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md p-4">
            <div className="max-w-7xl mx-auto">
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
    </div>
  );
};

export default KinkSelector;
