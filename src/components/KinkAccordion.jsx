import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryIcons } from '../data/kinkLevels';

const KinkAccordion = ({ category, selectedKinks, onKinkToggle, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const maxSelections = 5;

  return (
    <div className="mb-4">
      {/* En-tête de l'accordéon */}
      <motion.button
        className={`
          w-full px-6 py-4 
          bg-gradient-to-r from-amber-900/40 to-amber-800/20
          hover:from-amber-800/40 hover:to-amber-700/20
          border border-amber-700/30
          rounded-xl
          flex items-center justify-between
          group
          transition-all duration-300
          ${isOpen ? 'rounded-b-none border-b-0' : ''}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-4">
          <span className="text-3xl opacity-70 group-hover:opacity-100 transition-opacity">
            {categoryIcons[category.id]}
          </span>
          <div className="text-left">
            <h3 className="text-xl font-medium text-amber-100">
              {category.name}
            </h3>
            <p className="text-sm text-amber-200/70">
              {category.subcategories.length} options disponibles
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Compteur de sélections */}
          {selectedKinks.filter(k => category.subcategories.includes(k)).length > 0 && (
            <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-200 text-sm">
              {selectedKinks.filter(k => category.subcategories.includes(k)).length} sélectionné(s)
            </span>
          )}
          
          {/* Flèche animée */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-6 h-6 flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </motion.button>

      {/* Contenu de l'accordéon */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border border-t-0 border-amber-700/30 rounded-b-xl"
          >
            <div className="bg-black/20 backdrop-blur-sm p-6 grid grid-cols-2 gap-4">
              {category.subcategories.map((subcat) => (
                <motion.button
                  key={subcat}
                  className={`
                    px-4 py-3 rounded-lg
                    flex items-center justify-between
                    transition-all duration-300
                    ${selectedKinks.includes(subcat)
                      ? 'bg-amber-500/30 border-2 border-amber-500/50'
                      : 'bg-amber-900/20 border border-amber-700/30 hover:bg-amber-800/30'}
                    ${selectedKinks.length >= maxSelections && !selectedKinks.includes(subcat)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'}
                  `}
                  onClick={() => {
                    if (selectedKinks.length < maxSelections || selectedKinks.includes(subcat)) {
                      onKinkToggle(subcat);
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-amber-100">{subcat}</span>
                  {selectedKinks.includes(subcat) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-amber-500/30 rounded-full p-1"
                    >
                      <svg className="w-4 h-4 text-amber-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KinkAccordion;
