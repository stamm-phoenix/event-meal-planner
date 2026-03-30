File: App.tsx
```
import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Calendar,
  Utensils,
  ShoppingCart,
  Plus,
  Trash2,
  ChevronRight,
  Info,
  Save,
  Clock,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  Unlock,
  Package,
  Backpack,
  User,
  ArrowLeft,
  ChevronDown,
  Search,
  Filter,
  Download,
  Share2,
  Settings,
  Circle,
  ChevronLeft,
  Edit3,
  Copy,
  Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, createNewProject, MealBlock, Dish, Ingredient, Subgroup, Tool, GeneralIngredient } from './types';

function Modal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Speichern',
  confirmVariant = 'primary'
}: {
  isOpen: boolean,
  onClose: () => void,
  title: string,
  children: React.ReactNode,
  onConfirm?: () => void,
  confirmText?: string,
  confirmVariant?: 'primary' | 'danger'
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#141414]/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white border border-[#141414] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="p-6 border-b border-[#141414]/10 flex justify-between items-center">
            <h3 className="text-xl font-serif italic font-bold">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-[#141414]/5 rounded-full transition-all">
              <Plus size={20} className="rotate-45" />
            </button>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
          {onConfirm && (
            <div className="p-6 border-t border-[#141414]/10 flex justify-end gap-3 bg-[#E4E3E0]/10">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-all"
              >
                Abbrechen
              </button>
              <button
                onClick={onConfirm}
                className={`px-6 py-2 rounded-full text-sm font-bold shadow-lg transition-transform hover:scale-105 ${
                  confirmVariant === 'danger'
                  ? 'bg-red-500 text-white'
                  : 'bg-[#141414] text-[#E4E3E0]'
                }`}
              >
                {confirmText}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function SearchableIngredientSelect({
  ingredients,
  onSelect,
  placeholder,
  value
}: {
  ingredients: MasterIngredient[],
  onSelect: (ing: MasterIngredient | null, newName?: string) => void,
  placeholder: string,
  value: string
}) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = ingredients.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            // If user types something that doesn't match, we still want to keep the name
            onSelect(null, e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none">
          <Search size={14} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (query || filtered.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 w-full mt-1 bg-white border border-[#141414] rounded-xl shadow-xl max-h-48 overflow-y-auto"
          >
            {filtered.map(i => (
              <button
                key={i.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(i);
                  setQuery(i.name);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-[10px] hover:bg-[#141414] hover:text-white transition-colors border-b border-[#141414]/5 last:border-0"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold">{i.name}</span>
                  <span className="opacity-50 text-[8px] uppercase tracking-widest">{i.category} ({i.unit})</span>
                </div>
              </button>
            ))}
            {query && !ingredients.find(i => i.name.toLowerCase() === query.toLowerCase()) && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(null, query);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-[10px] bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold transition-colors"
              >
                + "{query}" als neue Zutat erstellen
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type Tab = 'basis' | 'plan' | 'gerichte' | 'zutaten' | 'einkauf' | 'lager' | 'packliste';

function SearchableDishSelect({
  dishes,
  onSelect,
  placeholder,
  disabled
}: {
  dishes: Dish[],
  onSelect: (dishId: string | null, newName?: string) => void,
  placeholder: string,
  disabled?: boolean
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredDishes = dishes.filter(d => d.name.toLowerCase().includes(query.toLowerCase()));

  if (disabled) {
    return (
      <div className="w-full bg-[#141414]/5 border border-[#141414]/10 rounded-lg px-2 py-1.5 text-[10px] font-medium opacity-50 cursor-not-allowed">
        {placeholder}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="w-full bg-white border border-[#141414]/20 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:border-[#141414] font-medium transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
          <Plus size={10} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (query || filteredDishes.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 w-full mt-1 bg-white border border-[#141414] rounded-xl shadow-xl max-h-48 overflow-y-auto"
          >
            {filteredDishes.map(d => (
              <button
                key={d.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(d.id);
                  setQuery('');
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-[10px] hover:bg-[#141414] hover:text-white transition-colors border-b border-[#141414]/5 last:border-0"
              >
                {d.name}
              </button>
            ))}
            {query && !dishes.find(d => d.name.toLowerCase() === query.toLowerCase()) && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(null, query);
                  setQuery('');
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-[10px] bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold transition-colors"
              >
                + "{query}" als neues Gericht erstellen
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('cookplanner_projects');
    return saved ? JSON.parse(saved) : [createNewProject('Mein erstes Lager')];
  });

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('cookplanner_username') || '';
  });

  useEffect(() => {
    localStorage.setItem('cookplanner_username', userName);
  }, [userName]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('basis');
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'category' | 'day' | 'dish' | 'store'>('category');
  const [lagerGroupBy, setLagerGroupBy] = useState<'category' | 'day' | 'dish' | 'store'>('category');
  const [hideCompleted, setHideCompleted] = useState(false);

  // Modal State
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  const project = useMemo(() => projects.find(p => p.id === currentProjectId), [projects, currentProjectId]);

  // Save to localStorage
  React.useEffect(() => {
    localStorage.setItem('cookplanner_projects', JSON.stringify(projects));
  }, [projects]);

  const updateCurrentProject = (updates: Partial<Project> | ((prev: Project) => Project)) => {
    if (!currentProjectId) return;
    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        if (typeof updates === 'function') return updates(p);
        return { ...p, ...updates };
      }
      return p;
    }));
  };

  const updateProjectDates = (startDate: string, endDate: string) => {
    let finalStart = startDate;
    let finalEnd = endDate;

    // If start is after end, adjust end to match start
    if (new Date(startDate) > new Date(endDate)) {
      finalEnd = startDate;
    }

    const start = new Date(finalStart);
    const end = new Date(finalEnd);
    const days: string[] = [];

    const current = new Date(start);
    let count = 0;
    while (current <= end && count < 31) {
      days.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
      count++;
    }

    updateCurrentProject(prev => {
      // Migrate old day names to new dates if they match the index
      const oldDays = ["Freitag", "Samstag", "Sonntag"];
      const newMealBlocks = prev.mealBlocks.map(block => {
        const oldIdx = oldDays.indexOf(block.day);
        if (oldIdx !== -1 && days[oldIdx]) {
          return { ...block, day: days[oldIdx] };
        }
        return block;
      });

      return {
        ...prev,
        startDate: finalStart,
        endDate: finalEnd,
        days,
        mealBlocks: newMealBlocks
      };
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  if (!project && currentProjectId) {
    setCurrentProjectId(null);
    return null;
  }

  const totalSubgroupCount = project ? project.subgroups.reduce((sum, sg) => sum + sg.count, 0) : 0;
  const mainGroupCount = project ? Math.max(0, project.totalPeople - totalSubgroupCount) : 0;

  const addSubgroup = () => {
    const newSg: Subgroup = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Neue Gruppe',
      count: 0
    };
    updateCurrentProject(prev => ({
      ...prev,
      subgroups: [...prev.subgroups, newSg]
    }));
  };

  const updateSubgroup = (id: string, updates: Partial<Subgroup>) => {
    updateCurrentProject(prev => ({
      ...prev,
      subgroups: prev.subgroups.map(sg => sg.id === id ? { ...sg, ...updates } : sg)
    }));
  };

  const removeSubgroup = (id: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      subgroups: prev.subgroups.filter(sg => sg.id !== id),
      mealBlocks: prev.mealBlocks.map(block => {
        const { [id]: _, ...rest } = block.subgroupDishes;
        return { ...block, subgroupDishes: rest };
      })
    }));
  };

  const addMealBlock = (day: string) => {
    const newBlock: MealBlock = {
      id: Math.random().toString(36).substr(2, 9),
      day,
      time: '12:00',
      label: 'Neue Mahlzeit',
      mainDishIds: [],
      subgroupDishes: {}
    };
    updateCurrentProject(prev => ({
      ...prev,
      mealBlocks: [...prev.mealBlocks, newBlock]
    }));
  };

  const removeMealBlock = (id: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      mealBlocks: prev.mealBlocks.filter(b => b.id !== id)
    }));
  };

  const updateMealBlock = (id: string, updates: Partial<MealBlock> | ((prev: MealBlock) => MealBlock)) => {
    updateCurrentProject(prev => ({
      ...prev,
      mealBlocks: prev.mealBlocks.map(b => {
        if (b.id === id) {
          if (typeof updates === 'function') return updates(b);
          return { ...b, ...updates };
        }
        return b;
      })
    }));
  };

  const handleAddDishToBlock = (blockId: string, dishId: string | null, newName?: string, subgroupId?: string) => {
    let finalDishId = dishId;

    if (!dishId && newName) {
      const newDish: Dish = {
        id: Math.random().toString(36).substr(2, 9),
        name: newName,
        baseServings: 1,
        ingredients: [],
        tools: [],
        generalIngredients: []
      };
      finalDishId = newDish.id;
      updateCurrentProject(prev => ({
        ...prev,
        dishes: [...prev.dishes, newDish]
      }));
    }

    if (finalDishId) {
      updateMealBlock(blockId, (prev) => {
        if (subgroupId) {
          const currentIds = Array.isArray(prev.subgroupDishes[subgroupId]) ? prev.subgroupDishes[subgroupId] : [];
          return {
            ...prev,
            subgroupDishes: { ...prev.subgroupDishes, [subgroupId]: [...currentIds, finalDishId!] }
          };
        } else {
          const currentIds = Array.isArray(prev.mainDishIds) ? prev.mainDishIds : [];
          return {
            ...prev,
            mainDishIds: [...currentIds, finalDishId!]
          };
        }
      });
    }
  };

  const addDish = () => {
    const newDish: Dish = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Neues Gericht',
      baseServings: 1,
      ingredients: [],
      tools: [],
      generalIngredients: []
    };
    updateCurrentProject(prev => ({
      ...prev,
      dishes: [...prev.dishes, newDish]
    }));
    setEditingDishId(newDish.id);
  };

  const updateDish = (id: string, updates: Partial<Dish>) => {
    updateCurrentProject(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  };

  const addIngredient = (dishId: string) => {
    const newIngredient: Ingredient = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Neue Zutat',
      amountPerPerson: 0,
      unit: 'g',
      category: 'Sonstiges'
    };
    updateCurrentProject(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => d.id === dishId ? { ...d, ingredients: [...d.ingredients, newIngredient] } : d)
    }));
  };

  const updateIngredient = (dishId: string, ingredientId: string, updates: Partial<Ingredient>) => {
    updateCurrentProject(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => d.id === dishId ? {
        ...d,
        ingredients: d.ingredients.map(i => i.id === ingredientId ? { ...i, ...updates } : i)
      } : d)
    }));
  };

  const removeIngredient = (dishId: string, ingredientId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => d.id === dishId ? {
        ...d,
        ingredients: d.ingredients.filter(i => i.id !== ingredientId)
      } : d)
    }));
  };

  const addTool = (dishId: string) => {
    const newTool: Tool = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Neues Werkzeug',
      responsiblePerson: ''
    };
    updateCurrentProject(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => d.id === dishId ? { ...d, tools: [...(d.tools || []), newTool] } : d)
    }));
  };

  const updateTool = (dishId: string, toolId: string, updates: Partial<Tool>) => {
    updateCurrentProject(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => d.id === dishId ? {
        ...d,
        tools: (d.tools || []).map(t => t.id === toolId ? { ...t, ...updates } : t)
      } : d)
    }));
  };

  const removeTool = (dishId: string, toolId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => d.id === dishId ? {
        ...d,
        tools: (d.tools || []).filter(t => t.id !== toolId)
      } : d)
    }));
  };

  const addGeneralIngredient = (dishId: string) => {
    const newGI: GeneralIngredient = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Gewürz/Zutat',
      category: 'Gewürze'
    };
    updateCurrentProject(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => d.id === dishId ? { ...d, generalIngredients: [...(d.generalIngredients || []), newGI] } : d)
    }));
  };

  const updateGeneralIngredient = (dishId: string, giId: string, updates: Partial<GeneralIngredient>) => {
    updateCurrentProject(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => d.id === dishId ? {
        ...d,
        generalIngredients: (d.generalIngredients || []).map(gi => gi.id === giId ? { ...gi, ...updates } : gi)
      } : d)
    }));
  };

  const removeGeneralIngredient = (dishId: string, giId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => d.id === dishId ? {
        ...d,
        generalIngredients: (d.generalIngredients || []).filter(gi => gi.id !== giId)
      } : d)
    }));
  };

  const addGeneralTool = () => {
    const newTool: Tool = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Allgemeines Werkzeug',
      responsiblePerson: ''
    };
    updateCurrentProject(prev => ({
      ...prev,
      generalTools: [...(prev.generalTools || []), newTool]
    }));
  };

  const updateGeneralTool = (toolId: string, updates: Partial<Tool>) => {
    updateCurrentProject(prev => ({
      ...prev,
      generalTools: (prev.generalTools || []).map(t => t.id === toolId ? { ...t, ...updates } : t)
    }));
  };

  const removeGeneralTool = (toolId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      generalTools: (prev.generalTools || []).filter(t => t.id !== toolId)
    }));
  };

  // Shopping List Calculation
  const shoppingList = useMemo(() => {
    if (!project) return [];

    interface ShoppingItem {
      name: string;
      amount: number;
      boughtAmount: number;
      unit: string;
      category: string;
      day?: string;
      dishName?: string;
      store?: string;
      sources: string[];
    }

    const items: ShoppingItem[] = [];

    // 1. Sort meal blocks chronologically
    const sortedBlocks = [...project.mealBlocks].sort((a, b) => {
      const dayA = project.days.indexOf(a.day);
      const dayB = project.days.indexOf(b.day);
      if (dayA !== dayB) return dayA - dayB;
      return a.time.localeCompare(b.time);
    });

    // 2. Track available bought amounts for FIFO allocation
    const availableBought = { ...(project.shoppingListState?.boughtAmounts || {}) };

    sortedBlocks.forEach(block => {
      const dishAssignments: Record<string, number> = {};

      // Main group dishes
      const mainDishIds = Array.isArray(block.mainDishIds) ? block.mainDishIds : [];
      mainDishIds.forEach(dishId => {
        dishAssignments[dishId] = (dishAssignments[dishId] || 0) + mainGroupCount;
      });

      // Subgroup dishes
      (project.subgroups || []).forEach(sg => {
        const specificDishIds = (block.subgroupDishes || {})[sg.id];
        const finalDishIds = (Array.isArray(specificDishIds) && specificDishIds.length > 0)
          ? specificDishIds
          : mainDishIds;

        finalDishIds.forEach(dishId => {
          dishAssignments[dishId] = (dishAssignments[dishId] || 0) + sg.count;
        });
      });

      Object.entries(dishAssignments).forEach(([dishId, count]) => {
        const dish = project.dishes.find(d => d.id === dishId);
        if (!dish || count <= 0) return;

        (dish.ingredients || []).forEach(ing => {
          const totalAmount = dish.isFixedAmount
            ? ing.amountPerPerson
            : (ing.amountPerPerson / (dish.baseServings || 1)) * count;
          const store = (project.shoppingListState?.stores || {})[`${ing.name}-${ing.unit}`] || 'Unbekannt';

          // FIFO Allocation
          const key = `${ing.name}-${ing.unit}`;
          const needed = totalAmount;
          const allocated = Math.min(needed, availableBought[key] || 0);
          availableBought[key] = Math.max(0, (availableBought[key] || 0) - allocated);

          if (!block.isCompleted) {
            items.push({
              name: ing.name,
              amount: totalAmount,
              boughtAmount: allocated,
              unit: ing.unit,
              category: ing.category,
              day: block.day,
              dishName: dish.name,
              store: store,
              sources: [
                dish.isFixedAmount
                  ? `${dish.name} (${formatDate(block.day)} ${block.time}): Fixe Menge (${ing.amountPerPerson}${ing.unit})`
                  : `${dish.name} (${formatDate(block.day)} ${block.time}): (${ing.amountPerPerson}${ing.unit} / ${dish.baseServings} Pers.) * ${count} Pers.`
              ]
            });
          }
        });

        // General ingredients (mengenunabhängig)
        (dish.generalIngredients || []).forEach(gi => {
          if (!block.isCompleted) {
            const isBought = !!(project.shoppingListState?.boughtGeneralIngredients || {})[gi.name];
            items.push({
              name: gi.name,
              amount: 0, // 0 signals general ingredient
              boughtAmount: isBought ? 1 : 0,
              unit: '',
              category: gi.category,
              day: block.day,
              dishName: dish.name,
              store: 'Gewürze',
              sources: [`${dish.name} (${formatDate(block.day)} ${block.time})`]
            });
          }
        });
      });
    });

    // Grouping logic
    const grouped: Record<string, ShoppingItem> = {};

    items.forEach(item => {
      let groupKey = '';
      if (groupBy === 'category') groupKey = `${item.category}-${item.name}-${item.unit}`;
      else if (groupBy === 'day') groupKey = `${item.day}-${item.name}-${item.unit}`;
      else if (groupBy === 'dish') groupKey = `${item.dishName}-${item.name}-${item.unit}`;
      else if (groupBy === 'store') groupKey = `${item.store}-${item.name}-${item.unit}`;

      if (!grouped[groupKey]) {
        grouped[groupKey] = { ...item, sources: [...item.sources] };
      } else {
        // Only add amounts if it's a regular ingredient
        if (item.amount > 0) {
          grouped[groupKey].amount += item.amount;
          grouped[groupKey].boughtAmount += item.boughtAmount;
        } else {
          // For general ingredients, just update boughtAmount if any source is bought
          // Actually, since they are global, they should all have the same bought state
          grouped[groupKey].boughtAmount = item.boughtAmount;
        }
        grouped[groupKey].sources.push(...item.sources);
      }
    });

    let result = Object.values(grouped).sort((a, b) => {
      if (groupBy === 'category') return a.category.localeCompare(b.category);
      if (groupBy === 'day') return (a.day || '').localeCompare(b.day || '');
      if (groupBy === 'dish') return (a.dishName || '').localeCompare(b.dishName || '');
      if (groupBy === 'store') return (a.store || '').localeCompare(b.store || '');
      return 0;
    });

    if (hideCompleted) {
      result = result.filter(i => {
        if (i.amount > 0) return i.boughtAmount < i.amount - 0.001;
        return i.boughtAmount === 0;
      });
    }

    return result;
  }, [project, groupBy, mainGroupCount, hideCompleted]);

  const lagerList = useMemo(() => {
    if (!project) return [];

    const availableBought = { ...(project.shoppingListState?.boughtAmounts || {}) };

    const sortedBlocks = [...project.mealBlocks].sort((a, b) => {
      const dayA = project.days.indexOf(a.day);
      const dayB = project.days.indexOf(b.day);
      if (dayA !== dayB) return dayA - dayB;
      return a.time.localeCompare(b.time);
    });

    const items: any[] = [];

    // 1. First pass: Consume stock for completed blocks
    sortedBlocks.filter(b => b.isCompleted).forEach(block => {
      const dishAssignments: Record<string, number> = {};
      const mainDishIds = Array.isArray(block.mainDishIds) ? block.mainDishIds : [];
      mainDishIds.forEach(dishId => {
        dishAssignments[dishId] = (dishAssignments[dishId] || 0) + mainGroupCount;
      });
      (project.subgroups || []).forEach(sg => {
        const specificDishIds = (block.subgroupDishes || {})[sg.id];
        const finalDishIds = (Array.isArray(specificDishIds) && specificDishIds.length > 0)
          ? specificDishIds
          : mainDishIds;
        finalDishIds.forEach(dishId => {
          dishAssignments[dishId] = (dishAssignments[dishId] || 0) + sg.count;
        });
      });

      Object.entries(dishAssignments).forEach(([dishId, count]) => {
        const dish = project.dishes.find(d => d.id === dishId);
        if (!dish || count <= 0) return;
        (dish.ingredients || []).forEach(ing => {
          const totalAmount = dish.isFixedAmount
            ? ing.amountPerPerson
            : (ing.amountPerPerson / (dish.baseServings || 1)) * count;
          const key = `${ing.name}-${ing.unit}`;
          availableBought[key] = Math.max(0, (availableBought[key] || 0) - totalAmount);
        });
      });
    });

    // 2. Second pass: Allocate remaining stock to future blocks
    sortedBlocks.filter(b => !b.isCompleted).forEach(block => {
      const dishAssignments: Record<string, number> = {};
      const mainDishIds = Array.isArray(block.mainDishIds) ? block.mainDishIds : [];
      mainDishIds.forEach(dishId => {
        dishAssignments[dishId] = (dishAssignments[dishId] || 0) + mainGroupCount;
      });
      (project.subgroups || []).forEach(sg => {
        const specificDishIds = (block.subgroupDishes || {})[sg.id];
        const finalDishIds = (Array.isArray(specificDishIds) && specificDishIds.length > 0)
          ? specificDishIds
          : mainDishIds;
        finalDishIds.forEach(dishId => {
          dishAssignments[dishId] = (dishAssignments[dishId] || 0) + sg.count;
        });
      });

      Object.entries(dishAssignments).forEach(([dishId, count]) => {
        const dish = project.dishes.find(d => d.id === dishId);
        if (!dish || count <= 0) return;
        (dish.ingredients || []).forEach(ing => {
          const totalAmount = dish.isFixedAmount
            ? ing.amountPerPerson
            : (ing.amountPerPerson / (dish.baseServings || 1)) * count;
          const key = `${ing.name}-${ing.unit}`;
          const allocated = Math.min(totalAmount, availableBought[key] || 0);

          if (allocated > 0.001) {
            const store = (project.shoppingListState?.stores || {})[key] || 'Unbekannt';
            items.push({
              name: ing.name,
              amount: allocated,
              unit: ing.unit,
              category: ing.category,
              day: block.day,
              dishName: dish.name,
              store: store
            });
            availableBought[key] = Math.max(0, (availableBought[key] || 0) - allocated);
          }
        });
      });
    });

    // 3. Third pass: Any remaining stock is "Überschuss"
    Object.entries(availableBought).forEach(([key, amount]) => {
      const val = amount as number;
      if (val > 0.001) {
        const [name, unit] = key.split('-');
        let category = 'Sonstiges';
        for (const dish of project.dishes) {
          const ing = dish.ingredients.find(i => i.name === name && i.unit === unit);
          if (ing) {
            category = ing.category;
            break;
          }
        }
        const store = (project.shoppingListState?.stores || {})[key] || 'Unbekannt';
        items.push({
          name,
          amount: val,
          unit,
          category,
          day: 'Überschuss',
          dishName: 'Keine Zuordnung',
          store
        });
      }
    });

    // Grouping logic
    const grouped: Record<string, any> = {};
    items.forEach(item => {
      let groupKey = '';
      if (lagerGroupBy === 'category') groupKey = item.category;
      else if (lagerGroupBy === 'day') groupKey = item.day;
      else if (lagerGroupBy === 'dish') groupKey = item.dishName;
      else if (lagerGroupBy === 'store') groupKey = item.store;

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }

      // Merge same items within the same group
      const existing = grouped[groupKey].find((i: any) => i.name === item.name && i.unit === item.unit);
      if (existing) {
        existing.amount += item.amount;
      } else {
        grouped[groupKey].push({ ...item });
      }
    });

    return Object.entries(grouped).map(([group, items]) => ({
      group,
      items: (items as any[]).sort((a, b) => a.name.localeCompare(b.name))
    })).sort((a, b) => a.group.localeCompare(b.group));
  }, [project, lagerGroupBy, mainGroupCount]);

  const generalShoppingList = useMemo(() => {
    if (!project) return [];
    const needed = new Set<string>();
    const giMap: Record<string, GeneralIngredient> = {};

    project.mealBlocks.forEach(block => {
      const dishIds = [
        ...(Array.isArray(block.mainDishIds) ? block.mainDishIds : []),
        ...Object.values(block.subgroupDishes || {}).flat()
      ];
      dishIds.forEach(id => {
        const dish = project.dishes.find(d => d.id === id);
        if (dish) {
          (dish.generalIngredients || []).forEach(gi => {
            needed.add(gi.name);
            giMap[gi.name] = gi;
          });
        }
      });
    });

    return Array.from(needed).map(name => ({
      name,
      category: giMap[name].category,
      isBought: !!(project.shoppingListState?.boughtGeneralIngredients || {})[name]
    })).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }, [project]);

  const packliste = useMemo(() => {
    if (!project) return [];

    interface PackItem {
      name: string;
      responsiblePerson: string;
      source: string;
    }

    const items: PackItem[] = [];

    // General tools
    (project.generalTools || []).forEach(t => {
      items.push({
        name: t.name,
        responsiblePerson: t.responsiblePerson || 'Unbekannt',
        source: 'Allgemein'
      });
    });

    // Dish tools
    project.mealBlocks.forEach(block => {
      const dishIds = [
        ...(Array.isArray(block.mainDishIds) ? block.mainDishIds : []),
        ...Object.values(block.subgroupDishes || {}).flat()
      ];
      dishIds.forEach(id => {
        const dish = project.dishes.find(d => d.id === id);
        if (dish) {
          (dish.tools || []).forEach(t => {
            items.push({
              name: t.name,
              responsiblePerson: t.responsiblePerson || 'Unbekannt',
              source: dish.name
            });
          });
        }
      });
    });

    // Deduplicate and group
    const grouped: Record<string, PackItem[]> = {};
    items.forEach(item => {
      const person = item.responsiblePerson;
      if (!grouped[person]) grouped[person] = [];

      // Only add if not already there with same name and source
      if (!grouped[person].find(i => i.name === item.name && i.source === item.source)) {
        grouped[person].push(item);
      }
    });

    return Object.entries(grouped).map(([person, items]) => ({
      person,
      items: items.sort((a, b) => a.name.localeCompare(b.name))
    })).sort((a, b) => a.person.localeCompare(b.person));
  }, [project]);

  if (!currentProjectId) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
        <header className="border-b border-[#141414] p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div>
            <h1 className="text-2xl font-serif italic font-bold tracking-tight">Group Cook Planner</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Projektverwaltung</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <label className="text-[8px] uppercase tracking-widest opacity-40 mb-1 font-bold">Dein Name</label>
              <div className="flex items-center gap-2 bg-white border border-[#141414] rounded-full px-4 py-1.5 shadow-sm">
                <User size={14} className="opacity-40" />
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Wer bist du?"
                  className="bg-transparent text-xs focus:outline-none w-32 font-medium"
                />
              </div>
            </div>
            <button
              onClick={() => {
                const newP = createNewProject();
                setProjects(prev => [...prev, newP]);
                setCurrentProjectId(newP.id);
              }}
              className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-6 py-2 rounded-full text-sm hover:scale-105 transition-transform shadow-lg"
            >
              <Plus size={18} /> Neues Projekt
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map(p => (
              <div
                key={p.id}
                className="bg-white border border-[#141414] rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-serif italic font-bold">{p.name}</h2>
                  <button
                    onClick={() => setProjects(prev => prev.filter(proj => proj.id !== p.id))}
                    className="text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex gap-4 text-[10px] uppercase tracking-widest opacity-50 mb-6">
                  <span className="flex items-center gap-1"><Users size={12} /> {p.totalPeople} Pers.</span>
                  <span className="flex items-center gap-1"><Utensils size={12} /> {p.dishes.length} Gerichte</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {p.mealBlocks.length} Mahlzeiten</span>
                </div>
                <button
                  onClick={() => setCurrentProjectId(p.id)}
                  className="w-full py-3 border border-[#141414] rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
                >
                  Projekt öffnen <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
          {projects.length === 0 && (
            <div className="text-center py-24 opacity-30 italic">
              <Info size={48} className="mx-auto mb-4" />
              <p>Keine Projekte vorhanden. Erstelle dein erstes Projekt!</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      <header className="border-b border-[#141414] p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentProjectId(null)}
            className="p-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors border border-[#141414] rounded-full"
          >
            <ChevronRight size={18} className="rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-serif italic font-bold tracking-tight">Group Cook Planner</h1>
            <p className="text-xs uppercase tracking-widest opacity-50 mt-1">{project.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <label className="text-[8px] uppercase tracking-widest opacity-40 mb-1 font-bold">Dein Name</label>
            <div className="flex items-center gap-2 bg-white border border-[#141414] rounded-full px-4 py-1.5 shadow-sm">
              <User size={14} className="opacity-40" />
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Wer bist du?"
                className="bg-transparent text-xs focus:outline-none w-32 font-medium"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors border border-[#141414] rounded-full">
              <Save size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <nav className="flex border border-[#141414] rounded-xl overflow-hidden mb-8 bg-white">
          {[
            { id: 'basis', label: 'Basisdaten', icon: Users },
            { id: 'plan', label: 'Zeitplan', icon: Calendar },
            { id: 'gerichte', label: 'Gerichte', icon: Utensils },
            { id: 'zutaten', label: 'Zutaten', icon: Filter },
            { id: 'einkauf', label: 'Einkaufsliste', icon: ShoppingCart },
            { id: 'lager', label: 'Lager', icon: Package },
            { id: 'packliste', label: 'Packliste', icon: Backpack },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 transition-all ${
                activeTab === tab.id
                ? 'bg-[#141414] text-[#E4E3E0]'
                : 'hover:bg-[#141414]/5'
              }`}
            >
              <tab.icon size={18} />
              <span className="font-medium hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          {activeTab === 'basis' && (
            <motion.div
              key="basis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <section className="bg-white p-8 rounded-2xl border border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <div className="flex justify-between items-center mb-6 border-b border-[#141414]/10 pb-2">
                  <h2 className="text-xl font-serif italic">Projekt Details</h2>
                  <button
                    onClick={() => {
                      setModalType('editProject');
                      setModalData({
                        name: project.name,
                        totalPeople: project.totalPeople,
                        startDate: project.startDate,
                        endDate: project.endDate
                      });
                    }}
                    className="p-2 hover:bg-[#141414]/5 rounded-full transition-all text-[#141414]/50 hover:text-[#141414]"
                  >
                    <Edit3 size={18} />
                  </button>
                </div>
                <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Projektname</label>
                        <p className="text-lg font-serif italic font-bold">{project.name}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Gesamtteilnehmer</label>
                        <p className="text-2xl font-mono font-bold">{project.totalPeople} Personen</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Startdatum</label>
                          <p className="text-sm font-mono">{project.startDate ? formatDate(project.startDate) : 'Nicht gesetzt'}</p>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Enddatum</label>
                          <p className="text-sm font-mono">{project.endDate ? formatDate(project.endDate) : 'Nicht gesetzt'}</p>
                        </div>
                      </div>
                  <div className="p-4 bg-blue-100/50 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest opacity-50">Hauptgruppe (Rest)</p>
                      <p className="text-xs opacity-70 italic">Teilnehmer ohne eigene Untergruppe</p>
                    </div>
                    <span className="text-2xl font-mono font-bold">{mainGroupCount}</span>
                  </div>
                </div>
              </section>

              <section className="bg-white p-8 rounded-2xl border border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <div className="flex justify-between items-center mb-6 border-b border-[#141414]/10 pb-2">
                  <h2 className="text-xl font-serif italic">Untergruppen</h2>
                  <button
                    onClick={() => {
                      setModalType('addSubgroup');
                      setModalData({ name: '', count: 0 });
                    }}
                    className="flex items-center gap-1 text-xs hover:underline text-blue-600"
                  >
                    <UserPlus size={14} /> Gruppe hinzufügen
                  </button>
                </div>
                <div className="space-y-4">
                  {project.subgroups.map(sg => (
                    <div key={sg.id} className="flex justify-between items-center bg-[#E4E3E0]/20 p-4 rounded-xl border border-transparent hover:border-[#141414]/10 transition-all group">
                      <div>
                        <p className="text-sm font-bold">{sg.name}</p>
                        <p className="text-xs opacity-50 font-mono">{sg.count} Personen</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setModalType('editSubgroup');
                            setModalData({ ...sg });
                          }}
                          className="p-1.5 hover:bg-[#141414]/5 rounded-lg transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setModalType('deleteSubgroup');
                            setModalData(sg.id);
                          }}
                          className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {project.subgroups.length === 0 && (
                    <p className="text-center py-8 text-xs opacity-30 italic">Keine Untergruppen definiert.</p>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {project.days.map((day) => (
                  <div key={day} className="bg-white rounded-2xl border border-[#141414] overflow-hidden flex flex-col shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                    <div className="bg-[#141414] text-[#E4E3E0] p-4 flex justify-between items-center">
                      <h3 className="font-serif italic text-lg">{formatDate(day)}</h3>
                      <button
                        onClick={() => {
                          setModalType('addMealBlock');
                          setModalData({ day, time: '12:00', label: 'Neue Mahlzeit', responsiblePerson: '' });
                        }}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="p-4 space-y-6 flex-1">
                        {project.mealBlocks.filter(b => b.day === day).sort((a, b) => a.time.localeCompare(b.time)).map((block) => {
                          const isMine = userName && block.responsiblePerson === userName;
                          return (
                            <div key={block.id} className={`group border border-[#141414] rounded-xl p-4 transition-all relative ${block.isCompleted ? 'bg-green-50/80 border-green-200 opacity-90' : 'hover:bg-[#141414]/5'} ${isMine ? 'ring-4 ring-orange-400 ring-offset-2' : ''}`}>
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2 text-xs font-mono font-bold">
                                    <Clock size={12} className="opacity-50" />
                                    {block.time}
                                  </div>
                                  {isMine && (
                                    <span className="bg-orange-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                                      Deine Schicht!
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => updateMealBlock(block.id, { isCompleted: !block.isCompleted })}
                                    className={`p-1 rounded-md transition-all ${block.isCompleted ? 'bg-green-100 text-green-600' : 'text-[#141414]/30 hover:text-[#141414] hover:bg-[#141414]/5'}`}
                                    title={block.isCompleted ? "Wieder öffnen" : "Abschließen"}
                                  >
                                    {block.isCompleted ? <CheckCircle2 size={14} /> : <Unlock size={14} />}
                                  </button>
                                  {!block.isCompleted && (
                                    <button
                                      onClick={() => {
                                        setModalType('editMealBlock');
                                        setModalData({ ...block });
                                      }}
                                      className="p-1 hover:bg-[#141414]/5 rounded-md transition-all"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                  )}
                                  {!block.isCompleted && (
                                    <button
                                      onClick={() => {
                                        setModalType('deleteMealBlock');
                                        setModalData(block.id);
                                      }}
                                      className="text-red-500 hover:bg-red-50 p-1 rounded-md transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="font-bold text-sm mb-1">{block.label}</p>
                              <div className="flex items-center gap-2 mb-4">
                                <label className="text-[9px] uppercase tracking-widest opacity-40">Verantwortlich:</label>
                                <span className="text-[10px] font-medium">{block.responsiblePerson || 'Nicht zugewiesen'}</span>
                              </div>

                              <div className={`space-y-4 ${block.isCompleted ? 'pointer-events-none' : ''}`}>
                            <div>
                              <label className="block text-[9px] uppercase tracking-widest opacity-40 mb-1">Hauptgerichte (Hauptgruppe + Standard)</label>
                              <div className="space-y-2 mb-2">
                                {Array.isArray(block.mainDishIds) && block.mainDishIds.map((dishId, idx) => {
                                  const dish = project.dishes.find(d => d.id === dishId);
                                  return (
                                    <div key={`${dishId}-${idx}`} className="flex items-center gap-2 bg-[#E4E3E0] rounded-lg px-2 py-1">
                                      <span className="text-xs font-medium flex-1 truncate">{dish?.name || 'Unbekannt'}</span>
                                      {!block.isCompleted && (
                                        <button
                                          onClick={() => {
                                            const currentIds = Array.isArray(block.mainDishIds) ? block.mainDishIds : [];
                                            const newIds = [...currentIds];
                                            newIds.splice(idx, 1);
                                            updateMealBlock(block.id, { mainDishIds: newIds });
                                          }}
                                          className="text-red-500 hover:bg-red-100 p-0.5 rounded"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <SearchableDishSelect
                                dishes={project.dishes}
                                onSelect={(id, name) => handleAddDishToBlock(block.id, id, name)}
                                placeholder="+ Gericht hinzufügen..."
                                disabled={block.isCompleted}
                              />
                            </div>

                            {project.subgroups.length > 0 && (
                              <div className="pt-2 border-t border-[#141414]/10">
                                <label className="block text-[9px] uppercase tracking-widest opacity-40 mb-2">Spezielle Gerichte für Gruppen</label>
                                <div className="space-y-4">
                                  {project.subgroups.map(sg => {
                                    const subgroupDishIds = (block.subgroupDishes || {})[sg.id] || [];
                                    return (
                                      <div key={sg.id} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-bold truncate opacity-60">{sg.name}:</span>
                                          {subgroupDishIds.length > 0 && !block.isCompleted && (
                                            <button
                                              onClick={() => {
                                                const { [sg.id]: _, ...rest } = (block.subgroupDishes || {});
                                                updateMealBlock(block.id, { subgroupDishes: rest });
                                              }}
                                              className="text-[8px] uppercase tracking-tighter text-red-500 hover:underline"
                                            >
                                              Reset
                                            </button>
                                          )}
                                        </div>
                                        <div className="space-y-1">
                                          {Array.isArray(subgroupDishIds) && subgroupDishIds.map((dishId, idx) => {
                                            const dish = project.dishes.find(d => d.id === dishId);
                                            return (
                                              <div key={`${dishId}-${idx}`} className="flex items-center gap-1 bg-white border border-[#141414]/10 rounded px-1.5 py-0.5">
                                                <span className="text-[9px] flex-1 truncate">{dish?.name || 'Unbekannt'}</span>
                                                {!block.isCompleted && (
                                                  <button
                                                    onClick={() => {
                                                      const newIds = [...subgroupDishIds];
                                                      newIds.splice(idx, 1);
                                                      updateMealBlock(block.id, {
                                                        subgroupDishes: { ...(block.subgroupDishes || {}), [sg.id]: newIds }
                                                      });
                                                    }}
                                                    className="text-red-400 hover:text-red-600"
                                                  >
                                                    <Trash2 size={10} />
                                                  </button>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                        <SearchableDishSelect
                                          dishes={project.dishes}
                                          onSelect={(id, name) => handleAddDishToBlock(block.id, id, name, sg.id)}
                                          placeholder={subgroupDishIds.length === 0 ? '+ Spezielles Gericht...' : '+ Weiteres Gericht...'}
                                          disabled={block.isCompleted}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'gerichte' && (
            <motion.div
              key="gerichte"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-1 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-serif italic">Meine Gerichte</h2>
                  <button
                    onClick={() => {
                      setModalType('addDish');
                      setModalData({ name: '', baseServings: 10, ingredients: [], tools: [], generalIngredients: [], notes: '', links: [], isFixedAmount: false });
                    }}
                    className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-4 py-2 rounded-full text-sm hover:scale-105 transition-transform"
                  >
                    <Plus size={16} /> Neu
                  </button>
                </div>
                <div className="space-y-2">
                  {project.dishes.map(dish => (
                    <button
                      key={dish.id}
                      onClick={() => setEditingDishId(dish.id)}
                      className={`w-full text-left p-4 rounded-xl border border-[#141414] transition-all flex justify-between items-center ${
                        editingDishId === dish.id ? 'bg-[#141414] text-[#E4E3E0] shadow-[4px_4px_0px_0px_rgba(20,20,20,0.3)]' : 'bg-white hover:bg-[#141414]/5'
                      }`}
                    >
                      <span className="font-medium">{dish.name}</span>
                      <ChevronRight size={16} className={editingDishId === dish.id ? 'opacity-100' : 'opacity-30'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2">
                {editingDishId ? (
                  <div className="bg-white rounded-2xl border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
                    {project.dishes.filter(d => d.id === editingDishId).map(dish => (
                      <div key={dish.id} className="space-y-8">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Name des Gerichts</label>
                                <p className="text-2xl font-serif italic font-bold">{dish.name}</p>
                              </div>
                              <button
                                onClick={() => {
                                  setModalType('editDish');
                                  setModalData({ ...dish });
                                }}
                                className="p-2 hover:bg-[#141414]/5 rounded-full transition-all text-[#141414]/50 hover:text-[#141414]"
                              >
                                <Edit3 size={20} />
                              </button>
                            </div>
                            <div className="w-48">
                              <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Zutaten berechnet für (Pers.)</label>
                              <div className="flex items-center gap-2">
                                <p className="text-xl font-mono font-bold">{dish.baseServings} Personen</p>
                                {dish.isFixedAmount && (
                                  <span className="bg-orange-100 text-orange-600 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                                    Fixe Menge
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setModalType('deleteDish');
                              setModalData(dish.id);
                            }}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors ml-4"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Notizen</label>
                              <div className="w-full bg-[#E4E3E0]/20 border border-[#141414]/10 rounded-xl p-4 text-sm min-h-[100px] whitespace-pre-wrap italic opacity-70">
                                {dish.notes || 'Keine Notizen vorhanden.'}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Links / Quellen</label>
                              <div className="space-y-2 mb-2">
                                {(dish.links || []).map((link, idx) => (
                                  <div key={idx} className="flex items-center gap-2 bg-[#E4E3E0]/30 rounded-lg px-2 py-1">
                                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 truncate flex-1 hover:underline">{link}</a>
                                    <button
                                      onClick={() => {
                                        const newLinks = [...(dish.links || [])];
                                        newLinks.splice(idx, 1);
                                        updateDish(dish.id, { links: newLinks });
                                      }}
                                      className="text-red-400 hover:text-red-600"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <input
                                type="text"
                                placeholder="URL hinzufügen (Enter drücken)..."
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const val = (e.target as HTMLInputElement).value;
                                    if (val) {
                                      updateDish(dish.id, { links: [...(dish.links || []), val] });
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                }}
                                className="w-full bg-white/50 border border-[#141414]/10 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#141414] focus:bg-white transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-sm uppercase tracking-wider">
                              Zutaten {dish.isFixedAmount ? '(Fixe Menge)' : `(für ${dish.baseServings} Pers.)`}
                            </h3>
                            <button
                              onClick={() => {
                                setModalType('addIngredient');
                                setModalData({ dishId: dish.id, name: '', amountPerPerson: 0, unit: 'g', category: 'Sonstiges' });
                              }}
                              className="text-xs flex items-center gap-1 hover:underline text-blue-600"
                            >
                              <Plus size={14} /> Zutat hinzufügen
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-2 px-2 text-[10px] uppercase tracking-widest opacity-40">
                              <div className="col-span-5">Name</div>
                              <div className="col-span-2">Menge</div>
                              <div className="col-span-1">Einheit</div>
                              <div className="col-span-3">Kategorie</div>
                              <div className="col-span-1"></div>
                            </div>
                            {dish.ingredients.map(ing => (
                              <div key={ing.id} className="grid grid-cols-12 gap-2 items-center bg-[#E4E3E0]/30 p-2 rounded-lg border border-transparent hover:border-[#141414]/20 transition-all group">
                                <div className="col-span-5 text-sm font-medium">{ing.name}</div>
                                <div className="col-span-2 text-sm font-mono">{ing.amountPerPerson}</div>
                                <div className="col-span-1 text-sm">{ing.unit}</div>
                                <div className="col-span-3 text-[10px] uppercase tracking-widest opacity-50">{ing.category}</div>
                                <div className="col-span-1 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      setModalType('editIngredient');
                                      setModalData({ dishId: dish.id, ...ing });
                                    }}
                                    className="p-1 hover:bg-[#141414]/5 rounded transition-all"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setModalType('deleteIngredient');
                                      setModalData({ dishId: dish.id, ingredientId: ing.id });
                                    }}
                                    className="text-red-400 hover:text-red-600 p-1"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-sm uppercase tracking-wider">Werkzeuge</h3>
                              <button
                                onClick={() => {
                                  setModalType('addTool');
                                  setModalData({ dishId: dish.id, name: '', responsiblePerson: '' });
                                }}
                                className="text-xs flex items-center gap-1 hover:underline text-blue-600"
                              >
                                <Plus size={14} /> Werkzeug hinzufügen
                              </button>
                            </div>
                            <div className="space-y-2">
                              <div className="flex gap-2 px-2 text-[10px] uppercase tracking-widest opacity-40 mb-1">
                                <div className="flex-1">Name</div>
                                <div className="w-24">Verantwortlich</div>
                                <div className="w-4"></div>
                              </div>
                              {(dish.tools || []).map(tool => (
                                <div key={tool.id} className="flex gap-2 items-center bg-[#E4E3E0]/30 p-2 rounded-lg group">
                                  <div className="flex-1 text-xs font-medium">{tool.name}</div>
                                  <div className="w-24 text-[10px] font-mono opacity-60">{tool.responsiblePerson || 'Unbekannt'}</div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => {
                                        setModalType('editTool');
                                        setModalData({ dishId: dish.id, ...tool });
                                      }}
                                      className="p-1 hover:bg-[#141414]/5 rounded transition-all"
                                    >
                                      <Edit3 size={12} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setModalType('deleteTool');
                                        setModalData({ dishId: dish.id, toolId: tool.id });
                                      }}
                                      className="text-red-400 hover:text-red-600 p-1"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-sm uppercase tracking-wider">Gewürze / Sonstiges</h3>
                              <button
                                onClick={() => {
                                  setModalType('addGeneralIngredient');
                                  setModalData({ dishId: dish.id, name: '', category: 'Gewürze' });
                                }}
                                className="text-xs flex items-center gap-1 hover:underline text-blue-600"
                              >
                                <Plus size={14} /> Hinzufügen
                              </button>
                            </div>
                            <div className="space-y-2">
                              <div className="flex gap-2 px-2 text-[10px] uppercase tracking-widest opacity-40 mb-1">
                                <div className="flex-1">Name</div>
                                <div className="w-24">Kategorie</div>
                                <div className="w-4"></div>
                              </div>
                              {(dish.generalIngredients || []).map(gi => (
                                <div key={gi.id} className="flex gap-2 items-center bg-[#E4E3E0]/30 p-2 rounded-lg group">
                                  <div className="flex-1 text-xs font-medium">{gi.name}</div>
                                  <div className="w-24 text-[10px] uppercase tracking-widest opacity-50">{gi.category}</div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => {
                                        setModalType('editGeneralIngredient');
                                        setModalData({ dishId: dish.id, ...gi });
                                      }}
                                      className="p-1 hover:bg-[#141414]/5 rounded transition-all"
                                    >
                                      <Edit3 size={12} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setModalType('deleteGeneralIngredient');
                                        setModalData({ dishId: dish.id, giId: gi.id });
                                      }}
                                      className="text-red-400 hover:text-red-600 p-1"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-[#141414]/20 rounded-2xl p-12 text-[#141414]/40">
                    <Utensils size={48} className="mb-4 opacity-20" />
                    <p className="font-serif italic text-lg">Wähle ein Gericht aus oder erstelle ein neues.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'zutaten' && (
            <motion.div
              key="zutaten"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
                <div className="flex justify-between items-center mb-8 border-b border-[#141414] pb-6">
                  <div>
                    <h2 className="text-2xl font-serif italic">Zutatenliste</h2>
                    <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Zentrale Definition aller Zutaten</p>
                  </div>
                  <button
                    onClick={() => {
                      setModalType('addMasterIngredient');
                      setModalData({ name: '', unit: 'g', category: 'Sonstiges' });
                    }}
                    className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-4 py-2 rounded-full text-sm hover:scale-105 transition-transform"
                  >
                    <Plus size={16} /> Neu
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(project.masterIngredients || []).sort((a, b) => a.name.localeCompare(b.name)).map(mi => {
                    const usage = project.dishes.filter(d => d.ingredients.some(i => i.name === mi.name));
                    return (
                      <div key={mi.id} className="bg-[#E4E3E0]/30 border border-[#141414]/10 p-6 rounded-2xl group hover:border-[#141414] transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold">{mi.name}</h3>
                              <p className="text-[10px] uppercase tracking-widest opacity-50">{mi.category}</p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setModalType('editMasterIngredient');
                                  setModalData(mi);
                                }}
                                className="p-2 hover:bg-[#141414]/5 rounded-full transition-all text-[#141414]/50 hover:text-[#141414]"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (usage.length > 0) {
                                    alert(`Zutat kann nicht gelöscht werden, da sie in ${usage.length} Gerichten verwendet wird.`);
                                    return;
                                  }
                                  setModalType('deleteMasterIngredient');
                                  setModalData(mi.id);
                                }}
                                className={`p-2 rounded-full transition-all ${usage.length > 0 ? 'text-red-200 cursor-not-allowed' : 'text-red-400 hover:bg-red-50 hover:text-red-600'}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Standard-Einheit</label>
                              <p className="font-mono text-sm">{mi.unit}</p>
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Verwendung in Gerichten ({usage.length})</label>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {usage.length > 0 ? usage.map(d => (
                                  <span key={d.id} className="bg-white/50 border border-[#141414]/5 px-2 py-0.5 rounded text-[9px] font-medium">
                                    {d.name}
                                  </span>
                                )) : (
                                  <span className="text-[9px] italic opacity-40">Nicht verwendet</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'einkauf' && (
            <motion.div
              key="einkauf"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[#141414] pb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-serif italic">Einkaufsliste</h2>
                    <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Berechnet für {project.totalPeople} Personen</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-white border border-[#141414]/10 rounded-xl px-4 py-1.5 hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={hideCompleted}
                        onChange={(e) => setHideCompleted(e.target.checked)}
                        className="w-4 h-4 rounded border-[#141414]/20 text-[#141414] focus:ring-0"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Gekaufte ausblenden</span>
                    </label>
                    <div className="flex flex-wrap gap-2 bg-[#E4E3E0] p-1 rounded-xl border border-[#141414]/10">
                      {[
                        { id: 'category', label: 'Kategorie' },
                        { id: 'day', label: 'Tag' },
                        { id: 'dish', label: 'Gericht' },
                        { id: 'store', label: 'Laden' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setGroupBy(opt.id as any)}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                            groupBy === opt.id ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-white/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {shoppingList.length > 0 || generalShoppingList.length > 0 ? (
                  <div className="space-y-12">
                    {/* General Ingredients Section */}
                    {generalShoppingList.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 border-l-4 border-purple-600 pl-3">Gewürze & Mengenunabhängiges</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {generalShoppingList.map((item, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border transition-all flex items-center justify-between ${item.isBought ? 'bg-green-50/50 opacity-50 border-green-500/30' : 'bg-[#E4E3E0]/30 border-transparent hover:border-[#141414]'}`}>
                              <div>
                                <p className={`font-bold ${item.isBought ? 'line-through' : ''}`}>{item.name}</p>
                                <p className="text-[10px] opacity-40 uppercase tracking-widest">{item.category}</p>
                              </div>
                              <button
                                onClick={() => {
                                  updateCurrentProject(prev => ({
                                    ...prev,
                                    shoppingListState: {
                                      ...(prev.shoppingListState || { boughtAmounts: {}, stores: {}, boughtGeneralIngredients: {} }),
                                      boughtGeneralIngredients: {
                                        ...(prev.shoppingListState?.boughtGeneralIngredients || {}),
                                        [item.name]: !item.isBought
                                      }
                                    }
                                  }));
                                }}
                                className={`p-2 rounded-lg border transition-all ${item.isBought ? 'bg-green-500 text-white border-green-600' : 'bg-white border-[#141414]/10 hover:border-[#141414]'}`}
                              >
                                <ShoppingCart size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.from(new Set(shoppingList.map(i => {
                      if (groupBy === 'category') return i.category;
                      if (groupBy === 'day') return i.day;
                      if (groupBy === 'dish') return i.dishName;
                      if (groupBy === 'store') return i.store;
                      return '';
                    }))).map(group => (
                      <div key={group} className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600 border-l-4 border-orange-600 pl-3">
                          {groupBy === 'day' && group ? formatDate(group as string) : (group as string)}
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          {shoppingList.filter(i => {
                            if (groupBy === 'category') return i.category === group;
                            if (groupBy === 'day') return i.day === group;
                            if (groupBy === 'dish') return i.dishName === group;
                            if (groupBy === 'store') return i.store === group;
                            return false;
                          }).map((item, idx) => {
                            const key = `${item.name}-${item.unit}`;
                            const totalBought = (project.shoppingListState?.boughtAmounts || {})[key] || 0;
                            const store = (project.shoppingListState?.stores || {})[key] || '';

                            const isFullyBought = item.amount > 0
                              ? item.boughtAmount >= item.amount - 0.001
                              : item.boughtAmount === 1;
                            const isPartiallyBought = item.amount > 0 && item.boughtAmount > 0 && !isFullyBought;

                            let itemBgClass = "bg-[#E4E3E0]/30 border-transparent hover:border-[#141414]";
                            if (isFullyBought) itemBgClass = "bg-green-50/50 opacity-50 border-green-500/30";
                            else if (isPartiallyBought) itemBgClass = "bg-orange-50/50 border-orange-500/30";

                            return (
                              <div key={idx} className={`group relative p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center gap-4 ${itemBgClass}`}>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-bold ${isFullyBought ? 'line-through' : ''}`}>{item.name}</span>
                                    <span className="text-[10px] opacity-40">({item.category})</span>
                                    {isPartiallyBought && <span className="bg-orange-100 text-orange-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">Teilweise</span>}
                                    {isFullyBought && <span className="bg-green-100 text-green-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">Erledigt</span>}
                                  </div>
                                  <div className="text-[10px] opacity-50 mt-1 flex flex-col gap-1">
                                    {item.sources.map((source, sIdx) => (
                                      <span key={sIdx} className="flex items-center gap-1">
                                        <Utensils size={10} className="shrink-0" /> {source}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                  {item.amount > 0 && (
                                    <div className="flex items-center gap-2">
                                      <label className="text-[9px] uppercase tracking-widest opacity-40">Laden:</label>
                                      <span className="text-[10px] font-mono bg-white/50 px-2 py-1 rounded border border-[#141414]/5 min-w-[60px]">
                                        {store || '-'}
                                      </span>
                                    </div>
                                  )}

                                  {item.amount > 0 ? (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <label className="text-[9px] uppercase tracking-widest opacity-40">Gekauft:</label>
                                        <div className="flex items-center bg-white/50 border border-[#141414]/10 rounded overflow-hidden text-[10px]">
                                          <span className="px-2 py-1 font-mono">{item.boughtAmount.toFixed(1)}</span>
                                          <span className="bg-[#141414]/5 px-2 py-1 border-l border-[#141414]/10 opacity-60">/ {item.amount.toFixed(1)} {item.unit}</span>
                                        </div>
                                      </div>

                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => {
                                            setModalType('editShoppingListItem');
                                            setModalData({
                                              key,
                                              name: item.name,
                                              unit: item.unit,
                                              totalAmount: item.amount,
                                              boughtAmount: item.boughtAmount,
                                              store: store
                                            });
                                          }}
                                          className="p-2 rounded-lg border border-[#141414]/10 bg-white hover:border-[#141414] transition-all"
                                          title="Eintrag bearbeiten"
                                        >
                                          <Edit3 size={14} />
                                        </button>
                                        <button
                                          onClick={() => {
                                            const missing = item.amount - item.boughtAmount;
                                            const newVal = isFullyBought ? Math.max(0, totalBought - item.amount) : (totalBought + missing);
                                            updateCurrentProject(prev => ({
                                              ...prev,
                                              shoppingListState: {
                                                ...(prev.shoppingListState || { boughtAmounts: {}, stores: {}, boughtGeneralIngredients: {} }),
                                                boughtAmounts: { ...(prev.shoppingListState?.boughtAmounts || {}), [key]: newVal }
                                              }
                                            }));
                                          }}
                                          className={`p-2 rounded-lg border transition-all ${isFullyBought ? 'bg-green-500 text-white border-green-600' : 'bg-white border-[#141414]/10 hover:border-[#141414]'}`}
                                          title={isFullyBought ? "Als nicht gekauft markieren" : "Für diese Gruppe als gekauft markieren"}
                                        >
                                          <ShoppingCart size={14} />
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        updateCurrentProject(prev => ({
                                          ...prev,
                                          shoppingListState: {
                                            ...(prev.shoppingListState || { boughtAmounts: {}, stores: {}, boughtGeneralIngredients: {} }),
                                            boughtGeneralIngredients: {
                                              ...(prev.shoppingListState?.boughtGeneralIngredients || {}),
                                              [item.name]: !isFullyBought
                                            }
                                          }
                                        }));
                                      }}
                                      className={`p-2 rounded-lg border transition-all ${isFullyBought ? 'bg-green-500 text-white border-green-600' : 'bg-white border-[#141414]/10 hover:border-[#141414]'}`}
                                      title={isFullyBought ? "Als nicht gekauft markieren" : "Global als gekauft markieren"}
                                    >
                                      <ShoppingCart size={14} />
                                    </button>
                                  )}
                                </div>

                                {/* Calculation Tooltip */}
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 bg-[#141414] text-[#E4E3E0] p-3 rounded-lg text-[10px] shadow-xl">
                                  <p className="font-bold mb-1 uppercase tracking-widest border-b border-white/20 pb-1">Berechnung:</p>
                                  <ul className="space-y-1 opacity-80">
                                    {item.sources.map((s, i) => (
                                      <li key={i} className="flex items-start gap-1">
                                        <ArrowRight size={8} className="mt-1 shrink-0" />
                                        {s}
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="mt-2 pt-1 border-t border-white/20 font-bold">
                                    Summe: {item.amount.toFixed(1)} {item.unit}
                                  </div>
                                  <div className="absolute bottom-[-4px] left-4 w-2 h-2 bg-[#141414] rotate-45"></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-[#141414]/40">
                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-serif italic text-xl">Deine Einkaufsliste ist noch leer.</p>
                    <p className="text-sm mt-2">Füge Mahlzeiten im Zeitplan hinzu, um Zutaten zu generieren.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          {activeTab === 'lager' && (
            <motion.div
              key="lager"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[#141414] pb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-serif italic">Lagerbestand</h2>
                    <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Gekaufte Zutaten abzüglich abgeschlossener Mahlzeiten</p>
                  </div>
                  <div className="flex flex-wrap gap-2 bg-[#E4E3E0] p-1 rounded-xl border border-[#141414]/10">
                    {[
                      { id: 'category', label: 'Kategorie' },
                      { id: 'day', label: 'Tag' },
                      { id: 'dish', label: 'Gericht' },
                      { id: 'store', label: 'Laden' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setLagerGroupBy(opt.id as any)}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                          lagerGroupBy === opt.id ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-white/50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {lagerList.length > 0 ? (
                  <div className="space-y-12">
                    {lagerList.map(group => (
                      <div key={group.group} className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 border-l-4 border-blue-600 pl-3">{group.group}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {group.items.map((item: any, idx: number) => (
                            <div key={idx} className="bg-[#E4E3E0]/30 border border-[#141414]/10 p-4 rounded-xl flex justify-between items-center group hover:border-[#141414] transition-all">
                              <div>
                                <p className="font-bold">{item.name}</p>
                                <div className="flex gap-2 mt-1">
                                  <p className="text-[8px] opacity-50 uppercase tracking-widest bg-white/50 px-1 rounded">{item.category}</p>
                                  <p className="text-[8px] opacity-50 uppercase tracking-widest bg-white/50 px-1 rounded">{item.store}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-mono font-bold">{item.amount.toFixed(1)}</p>
                                <p className="text-[10px] opacity-50 uppercase tracking-widest">{item.unit}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-[#141414]/40">
                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-serif italic text-xl">Dein Lager ist leer.</p>
                    <p className="text-sm mt-2">Markiere Zutaten in der Einkaufsliste als gekauft, um sie hier zu sehen.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          {activeTab === 'packliste' && (
            <motion.div
              key="packliste"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[#141414] pb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-serif italic">Packliste</h2>
                    <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Werkzeuge und Ausrüstung</p>
                  </div>
                  <button
                    onClick={() => {
                      setModalType('addGeneralTool');
                      setModalData({ name: '', responsiblePerson: '' });
                    }}
                    className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-4 py-2 rounded-full text-sm hover:scale-105 transition-transform"
                  >
                    <Plus size={16} /> Allgemeines Werkzeug
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Allgemeine Werkzeuge verwalten</h3>
                    <div className="space-y-2">
                      {(project.generalTools || []).map(tool => (
                        <div key={tool.id} className="flex gap-2 items-center bg-[#E4E3E0]/30 p-2 rounded-lg group">
                          <div className="flex-1 text-xs font-medium">{tool.name}</div>
                          <div className="w-32 text-[10px] font-mono opacity-60">{tool.responsiblePerson || 'Nicht zugewiesen'}</div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setModalType('editGeneralTool');
                                setModalData({ ...tool });
                              }}
                              className="p-1 hover:bg-[#141414]/5 rounded transition-all"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setModalType('deleteGeneralTool');
                                setModalData(tool.id);
                              }}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {(project.generalTools || []).length === 0 && <p className="text-[10px] italic opacity-30">Keine allgemeinen Werkzeuge.</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-12">
                  {packliste.map(group => {
                    const isMine = userName && group.person === userName;
                    return (
                      <div key={group.person} className={`space-y-4 p-6 rounded-2xl border transition-all ${isMine ? 'bg-orange-50 border-orange-400 shadow-[4px_4px_0px_0px_rgba(251,146,60,1)]' : 'bg-[#E4E3E0]/20 border-[#141414]/10'}`}>
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                            <User size={16} className={isMine ? 'text-orange-600' : 'opacity-40'} />
                            {group.person || 'Nicht zugewiesen'}
                            {isMine && <span className="text-[10px] text-orange-600 normal-case font-medium">(Das bist du!)</span>}
                          </h3>
                          <span className="text-[10px] opacity-40 font-mono">{group.items.length} Teile</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {group.items.map((item, idx) => (
                            <div key={idx} className={`bg-white border p-4 rounded-xl flex justify-between items-center group/item transition-all ${isMine ? 'border-orange-200' : 'border-[#141414]/10 hover:border-[#141414]'}`}>
                              <div>
                                <p className="font-bold">{item.name}</p>
                                <p className="text-[8px] opacity-50 uppercase tracking-widest mt-1">Quelle: {item.source}</p>
                              </div>
                              <Backpack size={16} className="opacity-20" />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {packliste.length === 0 && (
                    <div className="py-20 text-center text-[#141414]/40">
                      <Save size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-serif italic text-xl">Die Packliste ist noch leer.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-[#141414] text-[#E4E3E0] py-2 px-6 text-[10px] uppercase tracking-widest flex justify-between items-center z-50">
        <div className="flex gap-6">
          <span>Projekt: {project.name}</span>
          <span>Gesamt: {project.totalPeople}</span>
          <span>Hauptgruppe: {mainGroupCount}</span>
        </div>
        <div className="flex gap-4 opacity-50">
          <span>v1.1.0</span>
          <span>© 2026 CookPlanner</span>
        </div>
      </footer>

      {modalType && (
        <Modal
          isOpen={!!modalType}
          onClose={() => {
            setModalType(null);
            setModalData(null);
          }}
          title={
            modalType === 'editProject' ? 'Projekt Details bearbeiten' :
            modalType === 'addSubgroup' ? 'Untergruppe hinzufügen' :
            modalType === 'editSubgroup' ? 'Untergruppe bearbeiten' :
            modalType === 'deleteSubgroup' ? 'Untergruppe löschen' :
            modalType === 'addMealBlock' ? 'Neue Mahlzeit hinzufügen' :
            modalType === 'editMealBlock' ? 'Mahlzeit bearbeiten' :
            modalType === 'deleteMealBlock' ? 'Mahlzeit löschen' :
            modalType === 'addDish' ? 'Neues Gericht' :
            modalType === 'editDish' ? 'Gericht bearbeiten' :
            modalType === 'deleteDish' ? 'Gericht löschen' :
            modalType === 'addIngredient' ? 'Zutat hinzufügen' :
            modalType === 'editIngredient' ? 'Zutat bearbeiten' :
            modalType === 'deleteIngredient' ? 'Zutat löschen' :
            modalType === 'addTool' ? 'Werkzeug hinzufügen' :
            modalType === 'editTool' ? 'Werkzeug bearbeiten' :
            modalType === 'deleteTool' ? 'Werkzeug löschen' :
            modalType === 'addGeneralIngredient' ? 'Gewürz/Sonstiges hinzufügen' :
            modalType === 'editGeneralIngredient' ? 'Gewürz/Sonstiges bearbeiten' :
            modalType === 'deleteGeneralIngredient' ? 'Gewürz/Sonstiges löschen' :
            modalType === 'addGeneralTool' ? 'Allgemeines Werkzeug hinzufügen' :
            modalType === 'editGeneralTool' ? 'Allgemeines Werkzeug bearbeiten' :
            modalType === 'deleteGeneralTool' ? 'Allgemeines Werkzeug löschen' :
            modalType === 'editShoppingListItem' ? 'Einkauf bearbeiten' :
            ''
          }
          confirmText={modalType.startsWith('delete') ? 'Löschen' : 'Speichern'}
          confirmVariant={modalType.startsWith('delete') ? 'danger' : 'primary'}
          onConfirm={() => {
            if (modalType === 'editProject') {
              updateProjectDates(modalData.startDate, modalData.endDate);
              updateCurrentProject({ name: modalData.name, totalPeople: modalData.totalPeople });
            } else if (modalType === 'addSubgroup') {
              updateCurrentProject(prev => ({ ...prev, subgroups: [...prev.subgroups, { ...modalData, id: Math.random().toString(36).substr(2, 9) }] }));
            } else if (modalType === 'editSubgroup') {
              updateCurrentProject(prev => ({ ...prev, subgroups: prev.subgroups.map(sg => sg.id === modalData.id ? modalData : sg) }));
            } else if (modalType === 'deleteSubgroup') {
              updateCurrentProject(prev => ({ ...prev, subgroups: prev.subgroups.filter(sg => sg.id !== modalData) }));
            } else if (modalType === 'addMealBlock') {
              const newBlock: MealBlock = {
                id: Math.random().toString(36).substr(2, 9),
                day: modalData.day,
                time: modalData.time,
                label: modalData.label,
                responsiblePerson: modalData.responsiblePerson || '',
                mainDishIds: [],
                subgroupDishes: {},
                isCompleted: false
              };
              updateCurrentProject(prev => ({
                ...prev,
                mealBlocks: [...prev.mealBlocks, newBlock]
              }));
            } else if (modalType === 'editMealBlock') {
              updateMealBlock(modalData.id, { time: modalData.time, label: modalData.label, responsiblePerson: modalData.responsiblePerson });
            } else if (modalType === 'deleteMealBlock') {
              updateCurrentProject(prev => ({ ...prev, mealBlocks: prev.mealBlocks.filter(b => b.id !== modalData) }));
            } else if (modalType === 'addDish') {
              const newDish: Dish = { ...modalData, id: Math.random().toString(36).substr(2, 9) };
              updateCurrentProject(prev => ({ ...prev, dishes: [...prev.dishes, newDish] }));
              setEditingDishId(newDish.id);
            } else if (modalType === 'editDish') {
              updateDish(modalData.id, modalData);
            } else if (modalType === 'deleteDish') {
              updateCurrentProject(prev => ({ ...prev, dishes: prev.dishes.filter(d => d.id !== modalData) }));
              setEditingDishId(null);
            } else if (modalType === 'addIngredient') {
              const newIng: Ingredient = {
                id: Math.random().toString(36).substr(2, 9),
                name: modalData.name,
                amountPerPerson: modalData.amountPerPerson,
                unit: modalData.unit,
                category: modalData.category
              };
              // Add to masterIngredients if not exists
              const exists = (project.masterIngredients || []).some(mi => mi.name.toLowerCase() === modalData.name.toLowerCase());
              if (!exists && modalData.name.trim()) {
                updateCurrentProject(prev => ({
                  ...prev,
                  masterIngredients: [...(prev.masterIngredients || []), {
                    id: Math.random().toString(36).substr(2, 9),
                    name: modalData.name,
                    unit: modalData.unit,
                    category: modalData.category
                  }]
                }));
              }
              updateDish(modalData.dishId, {
                ingredients: [...(project.dishes.find(d => d.id === modalData.dishId)?.ingredients || []), newIng]
              });
            } else if (modalType === 'editIngredient') {
              const dish = project.dishes.find(d => d.id === modalData.dishId);
              if (dish) {
                // Add to masterIngredients if not exists
                const exists = (project.masterIngredients || []).some(mi => mi.name.toLowerCase() === modalData.name.toLowerCase());
                if (!exists && modalData.name.trim()) {
                  updateCurrentProject(prev => ({
                    ...prev,
                    masterIngredients: [...(prev.masterIngredients || []), {
                      id: Math.random().toString(36).substr(2, 9),
                      name: modalData.name,
                      unit: modalData.unit,
                      category: modalData.category
                    }]
                  }));
                }
                updateDish(modalData.dishId, {
                  ingredients: dish.ingredients.map(ing => ing.id === modalData.id ? {
                    id: modalData.id,
                    name: modalData.name,
                    amountPerPerson: modalData.amountPerPerson,
                    unit: modalData.unit,
                    category: modalData.category
                  } : ing)
                });
              }
            } else if (modalType === 'deleteIngredient') {
              const dish = project.dishes.find(d => d.id === modalData.dishId);
              if (dish) {
                updateDish(modalData.dishId, {
                  ingredients: dish.ingredients.filter(ing => ing.id !== modalData.ingredientId)
                });
              }
            } else if (modalType === 'addTool') {
              const newTool: Tool = {
                id: Math.random().toString(36).substr(2, 9),
                name: modalData.name,
                responsiblePerson: modalData.responsiblePerson
              };
              updateDish(modalData.dishId, {
                tools: [...(project.dishes.find(d => d.id === modalData.dishId)?.tools || []), newTool]
              });
            } else if (modalType === 'editTool') {
              const dish = project.dishes.find(d => d.id === modalData.dishId);
              if (dish) {
                updateDish(modalData.dishId, {
                  tools: (dish.tools || []).map(t => t.id === modalData.id ? {
                    id: modalData.id,
                    name: modalData.name,
                    responsiblePerson: modalData.responsiblePerson
                  } : t)
                });
              }
            } else if (modalType === 'deleteTool') {
              const dish = project.dishes.find(d => d.id === modalData.dishId);
              if (dish) {
                updateDish(modalData.dishId, {
                  tools: (dish.tools || []).filter(t => t.id !== modalData.toolId)
                });
              }
            } else if (modalType === 'addGeneralIngredient') {
              const newGi: GeneralIngredient = {
                id: Math.random().toString(36).substr(2, 9),
                name: modalData.name,
                category: modalData.category
              };
              // Add to masterIngredients if not exists
              const exists = (project.masterIngredients || []).some(mi => mi.name.toLowerCase() === modalData.name.toLowerCase());
              if (!exists && modalData.name.trim()) {
                updateCurrentProject(prev => ({
                  ...prev,
                  masterIngredients: [...(prev.masterIngredients || []), {
                    id: Math.random().toString(36).substr(2, 9),
                    name: modalData.name,
                    unit: '',
                    category: modalData.category
                  }]
                }));
              }
              updateDish(modalData.dishId, {
                generalIngredients: [...(project.dishes.find(d => d.id === modalData.dishId)?.generalIngredients || []), newGi]
              });
            } else if (modalType === 'editGeneralIngredient') {
              const dish = project.dishes.find(d => d.id === modalData.dishId);
              if (dish) {
                // Add to masterIngredients if not exists
                const exists = (project.masterIngredients || []).some(mi => mi.name.toLowerCase() === modalData.name.toLowerCase());
                if (!exists && modalData.name.trim()) {
                  updateCurrentProject(prev => ({
                    ...prev,
                    masterIngredients: [...(prev.masterIngredients || []), {
                      id: Math.random().toString(36).substr(2, 9),
                      name: modalData.name,
                      unit: '',
                      category: modalData.category
                    }]
                  }));
                }
                updateDish(modalData.dishId, {
                  generalIngredients: (dish.generalIngredients || []).map(gi => gi.id === modalData.id ? {
                    id: modalData.id,
                    name: modalData.name,
                    category: modalData.category
                  } : gi)
                });
              }
            } else if (modalType === 'deleteGeneralIngredient') {
              const dish = project.dishes.find(d => d.id === modalData.dishId);
              if (dish) {
                updateDish(modalData.dishId, {
                  generalIngredients: (dish.generalIngredients || []).filter(gi => gi.id !== modalData.giId)
                });
              }
            } else if (modalType === 'addGeneralTool') {
              updateCurrentProject(prev => ({
                ...prev,
                generalTools: [...(prev.generalTools || []), { ...modalData, id: Math.random().toString(36).substr(2, 9) }]
              }));
            } else if (modalType === 'editGeneralTool') {
              updateCurrentProject(prev => ({
                ...prev,
                generalTools: (prev.generalTools || []).map(t => t.id === modalData.id ? modalData : t)
              }));
            } else if (modalType === 'deleteGeneralTool') {
              updateCurrentProject(prev => ({
                ...prev,
                generalTools: (prev.generalTools || []).filter(t => t.id !== modalData)
              }));
            } else if (modalType === 'addMasterIngredient') {
              updateCurrentProject(prev => ({
                ...prev,
                masterIngredients: [...(prev.masterIngredients || []), { ...modalData, id: Math.random().toString(36).substr(2, 9) }]
              }));
            } else if (modalType === 'editMasterIngredient') {
              const oldMi = project.masterIngredients.find(mi => mi.id === modalData.id);
              updateCurrentProject(prev => ({
                ...prev,
                masterIngredients: prev.masterIngredients.map(mi => mi.id === modalData.id ? modalData : mi),
                // Update all dishes that used the old name/unit/category
                dishes: prev.dishes.map(dish => ({
                  ...dish,
                  ingredients: dish.ingredients.map(ing => ing.name === oldMi?.name ? {
                    ...ing,
                    name: modalData.name,
                    unit: modalData.unit,
                    category: modalData.category
                  } : ing),
                  generalIngredients: (dish.generalIngredients || []).map(gi => gi.name === oldMi?.name ? {
                    ...gi,
                    name: modalData.name,
                    category: modalData.category
                  } : gi)
                }))
              }));
            } else if (modalType === 'deleteMasterIngredient') {
              updateCurrentProject(prev => ({
                ...prev,
                masterIngredients: prev.masterIngredients.filter(mi => mi.id !== modalData)
              }));
            } else if (modalType === 'editShoppingListItem') {
              updateCurrentProject(prev => ({
                ...prev,
                shoppingListState: {
                  ...(prev.shoppingListState || { boughtAmounts: {}, stores: {}, boughtGeneralIngredients: {} }),
                  stores: { ...(prev.shoppingListState?.stores || {}), [modalData.key]: modalData.store },
                  boughtAmounts: { ...(prev.shoppingListState?.boughtAmounts || {}), [modalData.key]: modalData.boughtAmount }
                }
              }));
            }
            setModalType(null);
            setModalData(null);
          }}
        >
          <div className="space-y-4">
            {modalType === 'editProject' && (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Projektname</label>
                  <input
                    type="text"
                    value={modalData.name}
                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Gesamtteilnehmer</label>
                  <input
                    type="number"
                    value={modalData.totalPeople}
                    onChange={(e) => setModalData({ ...modalData, totalPeople: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Startdatum</label>
                    <input
                      type="date"
                      value={modalData.startDate}
                      onChange={(e) => setModalData({ ...modalData, startDate: e.target.value })}
                      className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Enddatum</label>
                    <input
                      type="date"
                      value={modalData.endDate}
                      onChange={(e) => setModalData({ ...modalData, endDate: e.target.value })}
                      className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {(modalType === 'addSubgroup' || modalType === 'editSubgroup') && (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Name der Untergruppe</label>
                  <input
                    type="text"
                    value={modalData.name}
                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                    placeholder="z.B. Vegetarier, Glutenfrei..."
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Anzahl Personen</label>
                  <input
                    type="number"
                    value={modalData.count}
                    onChange={(e) => setModalData({ ...modalData, count: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all font-mono"
                  />
                </div>
              </>
            )}

            {modalType === 'deleteSubgroup' && (
              <p className="text-sm">Bist du sicher, dass du diese Untergruppe löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.</p>
            )}

            {(modalType === 'addMealBlock' || modalType === 'editMealBlock') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Uhrzeit</label>
                    <input
                      type="time"
                      value={modalData.time}
                      onChange={(e) => setModalData({ ...modalData, time: e.target.value })}
                      className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Bezeichnung</label>
                    <input
                      type="text"
                      value={modalData.label}
                      onChange={(e) => setModalData({ ...modalData, label: e.target.value })}
                      placeholder="z.B. Mittagessen"
                      className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Verantwortlich</label>
                  <input
                    type="text"
                    value={modalData.responsiblePerson}
                    onChange={(e) => setModalData({ ...modalData, responsiblePerson: e.target.value })}
                    placeholder="Name der Person"
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                  />
                </div>
              </>
            )}

            {modalType === 'deleteMealBlock' && (
              <p className="text-sm">Bist du sicher, dass du diese Mahlzeit löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.</p>
            )}

            {(modalType === 'addDish' || modalType === 'editDish') && (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Name des Gerichts</label>
                  <input
                    type="text"
                    value={modalData.name}
                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all font-serif italic"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Zutaten berechnet für (Pers.)</label>
                  <input
                    type="number"
                    value={modalData.baseServings}
                    onChange={(e) => setModalData({ ...modalData, baseServings: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="isFixedAmount"
                    checked={modalData.isFixedAmount || false}
                    onChange={(e) => setModalData({ ...modalData, isFixedAmount: e.target.checked })}
                    className="w-4 h-4 rounded border-[#141414]/20 text-[#141414] focus:ring-0"
                  />
                  <label htmlFor="isFixedAmount" className="text-xs font-medium cursor-pointer">
                    Fixe Menge (nicht nach Teilnehmerzahl skalieren)
                  </label>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Notizen</label>
                  <textarea
                    value={modalData.notes}
                    onChange={(e) => setModalData({ ...modalData, notes: e.target.value })}
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl p-4 text-sm min-h-[100px] focus:outline-none focus:border-[#141414] transition-all"
                  />
                </div>
              </>
            )}

            {modalType === 'deleteDish' && (
              <p className="text-sm">Bist du sicher, dass du dieses Gericht löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.</p>
            )}

            {(modalType === 'addIngredient' || modalType === 'editIngredient') && (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Name der Zutat</label>
                  <SearchableIngredientSelect
                    ingredients={project.masterIngredients || []}
                    value={modalData.name}
                    onSelect={(mi, newName) => {
                      if (mi) {
                        setModalData({
                          ...modalData,
                          name: mi.name,
                          unit: mi.unit,
                          category: mi.category
                        });
                      } else if (newName !== undefined) {
                        setModalData({ ...modalData, name: newName });
                      }
                    }}
                    placeholder="Zutat suchen oder neu erstellen..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">
                      {project.dishes.find(d => d.id === modalData.dishId)?.isFixedAmount ? 'Gesamtmenge' : 'Menge pro Person'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={modalData.amountPerPerson}
                      onChange={(e) => setModalData({ ...modalData, amountPerPerson: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Einheit</label>
                    <input
                      type="text"
                      value={modalData.unit}
                      onChange={(e) => setModalData({ ...modalData, unit: e.target.value })}
                      className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Kategorie</label>
                  <input
                    type="text"
                    value={modalData.category}
                    onChange={(e) => setModalData({ ...modalData, category: e.target.value })}
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                  />
                </div>
              </>
            )}

            {modalType === 'deleteIngredient' && (
              <p className="text-sm">Bist du sicher, dass du diese Zutat löschen möchtest?</p>
            )}

            {(modalType === 'addTool' || modalType === 'editTool') && (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Name des Werkzeugs</label>
                  <input
                    type="text"
                    value={modalData.name}
                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Verantwortlich</label>
                  <input
                    type="text"
                    value={modalData.responsiblePerson}
                    onChange={(e) => setModalData({ ...modalData, responsiblePerson: e.target.value })}
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                  />
                </div>
              </>
            )}

            {modalType === 'deleteTool' && (
              <p className="text-sm">Bist du sicher, dass du dieses Werkzeug löschen möchtest?</p>
            )}

            {(modalType === 'addGeneralIngredient' || modalType === 'editGeneralIngredient') && (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Name</label>
                  <input
                    type="text"
                    value={modalData.name}
                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Kategorie</label>
                  <input
                    type="text"
                    value={modalData.category}
                    onChange={(e) => setModalData({ ...modalData, category: e.target.value })}
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                  />
                </div>
              </>
            )}

            {modalType === 'deleteGeneralIngredient' && (
              <p className="text-sm">Bist du sicher, dass du dieses Element löschen möchtest?</p>
            )}

            {(modalType === 'addGeneralTool' || modalType === 'editGeneralTool') && (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Name des Werkzeugs</label>
                  <input
                    type="text"
                    value={modalData.name}
                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Verantwortlich</label>
                  <input
                    type="text"
                    value={modalData.responsiblePerson}
                    onChange={(e) => setModalData({ ...modalData, responsiblePerson: e.target.value })}
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                  />
                </div>
              </>
            )}

            {modalType === 'deleteGeneralTool' && (
              <p className="text-sm">Bist du sicher, dass du dieses allgemeine Werkzeug löschen möchtest?</p>
            )}

            {(modalType === 'addMasterIngredient' || modalType === 'editMasterIngredient') && (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Name der Zutat</label>
                  <input
                    type="text"
                    value={modalData.name}
                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Standard-Einheit</label>
                    <input
                      type="text"
                      value={modalData.unit}
                      onChange={(e) => setModalData({ ...modalData, unit: e.target.value })}
                      className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Kategorie</label>
                    <input
                      type="text"
                      value={modalData.category}
                      onChange={(e) => setModalData({ ...modalData, category: e.target.value })}
                      className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {modalType === 'deleteMasterIngredient' && (
              <p className="text-sm">Bist du sicher, dass du diese Zutat aus der zentralen Liste löschen möchtest?</p>
            )}

            {modalType === 'editShoppingListItem' && (
              <>
                <div className="bg-[#141414]/5 p-4 rounded-xl mb-4">
                  <p className="font-bold text-lg">{modalData.name}</p>
                  <p className="text-[10px] uppercase tracking-widest opacity-50">Bedarf: {modalData.totalAmount.toFixed(1)} {modalData.unit}</p>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Laden</label>
                  <input
                    type="text"
                    value={modalData.store}
                    onChange={(e) => setModalData({ ...modalData, store: e.target.value })}
                    placeholder="z.B. Aldi, Rewe..."
                    className="w-full bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#141414] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Gekaufte Menge</label>
                  <div className="flex items-center bg-[#E4E3E0]/30 border border-[#141414]/10 rounded-xl overflow-hidden">
                    <input
                      type="number"
                      step="0.01"
                      value={modalData.boughtAmount}
                      onChange={(e) => setModalData({ ...modalData, boughtAmount: parseFloat(e.target.value) || 0 })}
                      className="flex-1 px-4 py-2 bg-transparent focus:outline-none font-mono"
                    />
                    <span className="px-4 py-2 bg-[#141414]/5 text-[10px] border-l border-[#141414]/10">/ {modalData.totalAmount.toFixed(1)} {modalData.unit}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
```
---
File: types.ts
```
import { GoogleGenAI } from "@google/genai";

export interface Subgroup {
  id: string;
  name: string;
  count: number;
}

export interface Ingredient {
  id: string;
  name: string;
  amountPerPerson: number;
  unit: string;
  category: string;
}

export interface Tool {
  id: string;
  name: string;
  responsiblePerson: string;
}

export interface GeneralIngredient {
  id: string;
  name: string;
  category: string;
}

export interface Dish {
  id: string;
  name: string;
  ingredients: Ingredient[];
  tools: Tool[];
  generalIngredients: GeneralIngredient[];
  baseServings: number;
  isFixedAmount?: boolean;
  notes?: string;
  links?: string[];
}

export interface MealBlock {
  id: string;
  day: string;
  time: string;
  label: string;
  mainDishIds: string[]; // Changed from single ID
  subgroupDishes: Record<string, string[]>; // Changed from single ID
  isCompleted?: boolean;
  responsiblePerson?: string;
}

export interface MasterIngredient {
  id: string;
  name: string;
  unit: string;
  category: string;
}

export interface Project {
  id: string;
  name: string;
  totalPeople: number;
  subgroups: Subgroup[];
  days: string[];
  startDate?: string;
  endDate?: string;
  mealBlocks: MealBlock[];
  dishes: Dish[];
  masterIngredients: MasterIngredient[];
  generalTools: Tool[];
  shoppingListState: {
    boughtAmounts: Record<string, number>; // key: ingredientName-unit
    stores: Record<string, string>; // key: ingredientName-unit
    boughtGeneralIngredients: Record<string, boolean>; // key: ingredientName
  };
}

export const createNewProject = (name: string = "Neues Projekt"): Project => {
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const days: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);
  while (current <= end) {
    days.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    totalPeople: 20,
    startDate,
    endDate,
    subgroups: [
      { id: 'sg1', name: 'Vegetarier', count: 5 },
      { id: 'sg2', name: 'Veganer', count: 3 }
    ],
    days,
    mealBlocks: [
      { id: '1', day: days[0], time: '19:00', label: 'Abendessen', mainDishIds: [], subgroupDishes: {}, responsiblePerson: '' },
      { id: '2', day: days[1], time: '08:00', label: 'Frühstück', mainDishIds: [], subgroupDishes: {}, responsiblePerson: '' },
      { id: '3', day: days[1], time: '12:30', label: 'Mittagessen', mainDishIds: [], subgroupDishes: {}, responsiblePerson: '' },
      { id: '4', day: days[1], time: '15:30', label: 'Kaffee & Kuchen', mainDishIds: [], subgroupDishes: {}, responsiblePerson: '' },
      { id: '5', day: days[1], time: '19:00', label: 'Abendessen', mainDishIds: [], subgroupDishes: {}, responsiblePerson: '' },
      { id: '6', day: days[2], time: '08:30', label: 'Frühstück', mainDishIds: [], subgroupDishes: {}, responsiblePerson: '' },
      { id: '7', day: days[2], time: '12:30', label: 'Mittagessen', mainDishIds: [], subgroupDishes: {}, responsiblePerson: '' },
    ],
    dishes: [
      {
        id: 'd1',
        name: 'Käsespätzle',
        baseServings: 1,
        ingredients: [
          { id: 'i1', name: 'Spätzle', amountPerPerson: 150, unit: 'g', category: 'Teigwaren' },
          { id: 'i2', name: 'Käse', amountPerPerson: 50, unit: 'g', category: 'Kühlregal' },
          { id: 'i3', name: 'Zwiebeln', amountPerPerson: 0.5, unit: 'Stk', category: 'Gemüse' },
        ],
        tools: [],
        generalIngredients: []
      },
      {
        id: 'd2',
        name: 'Grüner Salat',
        baseServings: 1,
        ingredients: [
          { id: 'i4', name: 'Salat', amountPerPerson: 0.25, unit: 'Kopf', category: 'Gemüse' },
        ],
        tools: [],
        generalIngredients: []
      }
    ],
    masterIngredients: [
      { id: 'mi1', name: 'Spätzle', unit: 'g', category: 'Teigwaren' },
      { id: 'mi2', name: 'Käse', unit: 'g', category: 'Kühlregal' },
      { id: 'mi3', name: 'Zwiebeln', unit: 'Stk', category: 'Gemüse' },
      { id: 'mi4', name: 'Salat', unit: 'Kopf', category: 'Gemüse' },
    ],
    generalTools: [],
    shoppingListState: {
      boughtAmounts: {},
      stores: {},
      boughtGeneralIngredients: {}
    }
  };
};
```