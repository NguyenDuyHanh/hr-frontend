import { create } from 'zustand';

const STORAGE_KEY = 'hrm_selected_sections';

const getInitialSections = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to read selected sections from localStorage:', error);
    return [];
  }
};

const saveSections = (sections) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  } catch (error) {
    console.error('Failed to save selected sections to localStorage:', error);
  }
};

const useMenuFilterStore = create((set, get) => ({
  selectedSections: getInitialSections(),

  toggleSection: (sectionName, isMultiSelect = false) => {
    set((state) => {
      let nextSections = [];
      const current = state.selectedSections;

      if (isMultiSelect) {
        if (current.includes(sectionName)) {
          nextSections = current.filter((s) => s !== sectionName);
        } else {
          nextSections = [...current, sectionName];
        }
      } else {
        // Single select mode
        if (current.length === 1 && current[0] === sectionName) {
          // Clicking the same single section toggles back to all
          nextSections = [];
        } else {
          nextSections = [sectionName];
        }
      }

      saveSections(nextSections);
      return { selectedSections: nextSections };
    }, false, 'toggleSection');
  },

  resetFilter: () => {
    saveSections([]);
    set({ selectedSections: [] });
  },

  setSelectedSections: (sections) => {
    saveSections(sections);
    set({ selectedSections: sections });
  },
}));

export default useMenuFilterStore;
