import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  createNewProject,
  Dish,
  GeneralIngredient,
  generateId,
  Ingredient,
  MealBlock,
  MasterIngredient,
  Project,
  Subgroup,
  Tool,
} from '../models/project.model';
import { STORAGE_SERVICE } from './storage.service';

export type Tab = 'basis' | 'plan' | 'gerichte' | 'zutaten' | 'einkauf' | 'lager' | 'packliste';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private storage = inject(STORAGE_SERVICE);

  readonly projects = signal<Project[]>([]);
  readonly currentProjectId = signal<string | null>(null);
  readonly userName = signal<string>('');
  readonly activeTab = signal<Tab>('basis');
  readonly editingDishId = signal<string | null>(null);

  private initialized = false;

  readonly currentProject = computed(() => {
    const id = this.currentProjectId();
    return this.projects().find(p => p.id === id) ?? null;
  });

  readonly totalSubgroupCount = computed(() => {
    const project = this.currentProject();
    return project ? project.subgroups.reduce((sum, sg) => sum + sg.count, 0) : 0;
  });

  readonly mainGroupCount = computed(() => {
    const project = this.currentProject();
    return project ? Math.max(0, project.totalPeople - this.totalSubgroupCount()) : 0;
  });

  constructor() {
    effect(() => {
      const projects = this.projects();
      if (this.initialized) {
        this.storage.saveProjects(projects);
      }
    });

    effect(() => {
      const name = this.userName();
      if (this.initialized) {
        this.storage.saveUserName(name);
      }
    });
  }

  async initialize(): Promise<void> {
    const [projects, userName] = await Promise.all([
      this.storage.getProjects(),
      this.storage.getUserName(),
    ]);
    if (projects.length === 0) {
      this.projects.set([createNewProject('Mein erstes Lager')]);
    } else {
      this.projects.set(projects);
    }
    this.userName.set(userName);
    this.initialized = true;
  }

  // Project CRUD
  createProject(name?: string): Project {
    const p = createNewProject(name);
    this.projects.update(prev => [...prev, p]);
    return p;
  }

  deleteProject(id: string): void {
    this.projects.update(prev => prev.filter(p => p.id !== id));
    if (this.currentProjectId() === id) {
      this.currentProjectId.set(null);
    }
  }

  selectProject(id: string | null): void {
    this.currentProjectId.set(id);
    if (id) {
      this.activeTab.set('basis');
    }
  }

  private updateCurrentProject(updater: (project: Project) => Project): void {
    const id = this.currentProjectId();
    if (!id) return;
    this.projects.update(prev =>
      prev.map(p => (p.id === id ? updater(p) : p))
    );
  }

  // Project details
  updateProjectDetails(updates: { name?: string; totalPeople?: number }): void {
    this.updateCurrentProject(p => ({ ...p, ...updates }));
  }

  updateProjectDates(startDate: string, endDate: string): void {
    let finalStart = startDate;
    let finalEnd = endDate;
    if (new Date(finalStart) > new Date(finalEnd)) {
      finalEnd = finalStart;
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

    this.updateCurrentProject(prev => {
      const oldDays = ['Freitag', 'Samstag', 'Sonntag'];
      const newMealBlocks = prev.mealBlocks.map(block => {
        const oldIdx = oldDays.indexOf(block.day);
        if (oldIdx !== -1 && days[oldIdx]) {
          return { ...block, day: days[oldIdx] };
        }
        return block;
      });

      return { ...prev, startDate: finalStart, endDate: finalEnd, days, mealBlocks: newMealBlocks };
    });
  }

  // Subgroups
  addSubgroup(data: { name: string; count: number }): void {
    this.updateCurrentProject(p => ({
      ...p,
      subgroups: [...p.subgroups, { ...data, id: generateId() }],
    }));
  }

  updateSubgroup(id: string, updates: Partial<Subgroup>): void {
    this.updateCurrentProject(p => ({
      ...p,
      subgroups: p.subgroups.map(sg => (sg.id === id ? { ...sg, ...updates } : sg)),
    }));
  }

  removeSubgroup(id: string): void {
    this.updateCurrentProject(p => ({
      ...p,
      subgroups: p.subgroups.filter(sg => sg.id !== id),
      mealBlocks: p.mealBlocks.map(block => {
        const { [id]: _, ...rest } = block.subgroupDishes;
        return { ...block, subgroupDishes: rest };
      }),
    }));
  }

  // Meal Blocks
  addMealBlock(data: { day: string; time: string; label: string; responsiblePerson?: string }): void {
    const newBlock: MealBlock = {
      id: generateId(),
      day: data.day,
      time: data.time,
      label: data.label,
      responsiblePerson: data.responsiblePerson ?? '',
      mainDishIds: [],
      subgroupDishes: {},
      isCompleted: false,
    };
    this.updateCurrentProject(p => ({
      ...p,
      mealBlocks: [...p.mealBlocks, newBlock],
    }));
  }

  updateMealBlock(id: string, updates: Partial<MealBlock>): void {
    this.updateCurrentProject(p => ({
      ...p,
      mealBlocks: p.mealBlocks.map(b => (b.id === id ? { ...b, ...updates } : b)),
    }));
  }

  removeMealBlock(id: string): void {
    this.updateCurrentProject(p => ({
      ...p,
      mealBlocks: p.mealBlocks.filter(b => b.id !== id),
    }));
  }

  toggleMealBlockCompleted(id: string): void {
    this.updateCurrentProject(p => ({
      ...p,
      mealBlocks: p.mealBlocks.map(b =>
        b.id === id ? { ...b, isCompleted: !b.isCompleted } : b
      ),
    }));
  }

  addDishToBlock(blockId: string, dishId: string | null, newName?: string, subgroupId?: string): void {
    let finalDishId = dishId;

    if (!dishId && newName) {
      const newDish: Dish = {
        id: generateId(),
        name: newName,
        baseServings: 1,
        ingredients: [],
        tools: [],
        generalIngredients: [],
      };
      finalDishId = newDish.id;
      this.updateCurrentProject(p => ({
        ...p,
        dishes: [...p.dishes, newDish],
      }));
    }

    if (finalDishId) {
      const did = finalDishId;
      this.updateCurrentProject(p => ({
        ...p,
        mealBlocks: p.mealBlocks.map(block => {
          if (block.id !== blockId) return block;
          if (subgroupId) {
            const currentIds = Array.isArray(block.subgroupDishes[subgroupId])
              ? block.subgroupDishes[subgroupId]
              : [];
            return {
              ...block,
              subgroupDishes: { ...block.subgroupDishes, [subgroupId]: [...currentIds, did] },
            };
          } else {
            const currentIds = Array.isArray(block.mainDishIds) ? block.mainDishIds : [];
            return { ...block, mainDishIds: [...currentIds, did] };
          }
        }),
      }));
    }
  }

  removeDishFromBlock(blockId: string, index: number, subgroupId?: string): void {
    this.updateCurrentProject(p => ({
      ...p,
      mealBlocks: p.mealBlocks.map(block => {
        if (block.id !== blockId) return block;
        if (subgroupId) {
          const newIds = [...(block.subgroupDishes[subgroupId] || [])];
          newIds.splice(index, 1);
          return {
            ...block,
            subgroupDishes: { ...block.subgroupDishes, [subgroupId]: newIds },
          };
        } else {
          const newIds = [...(block.mainDishIds || [])];
          newIds.splice(index, 1);
          return { ...block, mainDishIds: newIds };
        }
      }),
    }));
  }

  resetSubgroupDishes(blockId: string, subgroupId: string): void {
    this.updateCurrentProject(p => ({
      ...p,
      mealBlocks: p.mealBlocks.map(block => {
        if (block.id !== blockId) return block;
        const { [subgroupId]: _, ...rest } = block.subgroupDishes;
        return { ...block, subgroupDishes: rest };
      }),
    }));
  }

  // Dishes
  addDish(data: { name: string; baseServings: number; isFixedAmount?: boolean; notes?: string }): Dish {
    const newDish: Dish = {
      id: generateId(),
      name: data.name,
      baseServings: data.baseServings,
      isFixedAmount: data.isFixedAmount,
      notes: data.notes,
      ingredients: [],
      tools: [],
      generalIngredients: [],
      links: [],
    };
    this.updateCurrentProject(p => ({
      ...p,
      dishes: [...p.dishes, newDish],
    }));
    this.editingDishId.set(newDish.id);
    return newDish;
  }

  updateDish(id: string, updates: Partial<Dish>): void {
    this.updateCurrentProject(p => ({
      ...p,
      dishes: p.dishes.map(d => (d.id === id ? { ...d, ...updates } : d)),
    }));
  }

  removeDish(id: string): void {
    this.updateCurrentProject(p => ({
      ...p,
      dishes: p.dishes.filter(d => d.id !== id),
    }));
    if (this.editingDishId() === id) {
      this.editingDishId.set(null);
    }
  }

  // Dish Ingredients
  addIngredientToDish(dishId: string, data: { name: string; amountPerPerson: number; unit: string; category: string }): void {
    const newIng: Ingredient = { id: generateId(), ...data };
    this.updateCurrentProject(p => {
      const exists = (p.masterIngredients || []).some(
        mi => mi.name.toLowerCase() === data.name.toLowerCase()
      );
      const masterUpdate = !exists && data.name.trim()
        ? [...(p.masterIngredients || []), { id: generateId(), name: data.name, unit: data.unit, category: data.category }]
        : p.masterIngredients;

      return {
        ...p,
        masterIngredients: masterUpdate,
        dishes: p.dishes.map(d =>
          d.id === dishId ? { ...d, ingredients: [...d.ingredients, newIng] } : d
        ),
      };
    });
  }

  updateIngredientInDish(dishId: string, ingredientId: string, updates: Partial<Ingredient>): void {
    this.updateCurrentProject(p => {
      const updatedName = updates.name;
      const exists = updatedName
        ? (p.masterIngredients || []).some(mi => mi.name.toLowerCase() === updatedName.toLowerCase())
        : true;
      const masterUpdate =
        !exists && updatedName?.trim()
          ? [...(p.masterIngredients || []), { id: generateId(), name: updatedName, unit: updates.unit ?? '', category: updates.category ?? 'Sonstiges' }]
          : p.masterIngredients;

      return {
        ...p,
        masterIngredients: masterUpdate,
        dishes: p.dishes.map(d =>
          d.id === dishId
            ? { ...d, ingredients: d.ingredients.map(i => (i.id === ingredientId ? { ...i, ...updates } : i)) }
            : d
        ),
      };
    });
  }

  removeIngredientFromDish(dishId: string, ingredientId: string): void {
    this.updateCurrentProject(p => ({
      ...p,
      dishes: p.dishes.map(d =>
        d.id === dishId ? { ...d, ingredients: d.ingredients.filter(i => i.id !== ingredientId) } : d
      ),
    }));
  }

  // Dish Tools
  addToolToDish(dishId: string, data: { name: string; responsiblePerson: string }): void {
    const newTool: Tool = { id: generateId(), ...data };
    this.updateCurrentProject(p => ({
      ...p,
      dishes: p.dishes.map(d =>
        d.id === dishId ? { ...d, tools: [...(d.tools || []), newTool] } : d
      ),
    }));
  }

  updateToolInDish(dishId: string, toolId: string, updates: Partial<Tool>): void {
    this.updateCurrentProject(p => ({
      ...p,
      dishes: p.dishes.map(d =>
        d.id === dishId
          ? { ...d, tools: (d.tools || []).map(t => (t.id === toolId ? { ...t, ...updates } : t)) }
          : d
      ),
    }));
  }

  removeToolFromDish(dishId: string, toolId: string): void {
    this.updateCurrentProject(p => ({
      ...p,
      dishes: p.dishes.map(d =>
        d.id === dishId ? { ...d, tools: (d.tools || []).filter(t => t.id !== toolId) } : d
      ),
    }));
  }

  // Dish General Ingredients
  addGeneralIngredientToDish(dishId: string, data: { name: string; category: string }): void {
    const newGI: GeneralIngredient = { id: generateId(), ...data };
    this.updateCurrentProject(p => {
      const exists = (p.masterIngredients || []).some(
        mi => mi.name.toLowerCase() === data.name.toLowerCase()
      );
      const masterUpdate = !exists && data.name.trim()
        ? [...(p.masterIngredients || []), { id: generateId(), name: data.name, unit: '', category: data.category }]
        : p.masterIngredients;

      return {
        ...p,
        masterIngredients: masterUpdate,
        dishes: p.dishes.map(d =>
          d.id === dishId
            ? { ...d, generalIngredients: [...(d.generalIngredients || []), newGI] }
            : d
        ),
      };
    });
  }

  updateGeneralIngredientInDish(dishId: string, giId: string, updates: Partial<GeneralIngredient>): void {
    this.updateCurrentProject(p => {
      const updatedName = updates.name;
      const exists = updatedName
        ? (p.masterIngredients || []).some(mi => mi.name.toLowerCase() === updatedName.toLowerCase())
        : true;
      const masterUpdate =
        !exists && updatedName?.trim()
          ? [...(p.masterIngredients || []), { id: generateId(), name: updatedName, unit: '', category: updates.category ?? 'Sonstiges' }]
          : p.masterIngredients;

      return {
        ...p,
        masterIngredients: masterUpdate,
        dishes: p.dishes.map(d =>
          d.id === dishId
            ? { ...d, generalIngredients: (d.generalIngredients || []).map(gi => (gi.id === giId ? { ...gi, ...updates } : gi)) }
            : d
        ),
      };
    });
  }

  removeGeneralIngredientFromDish(dishId: string, giId: string): void {
    this.updateCurrentProject(p => ({
      ...p,
      dishes: p.dishes.map(d =>
        d.id === dishId
          ? { ...d, generalIngredients: (d.generalIngredients || []).filter(gi => gi.id !== giId) }
          : d
      ),
    }));
  }

  // General Tools
  addGeneralTool(data: { name: string; responsiblePerson: string }): void {
    this.updateCurrentProject(p => ({
      ...p,
      generalTools: [...(p.generalTools || []), { id: generateId(), ...data }],
    }));
  }

  updateGeneralTool(toolId: string, updates: Partial<Tool>): void {
    this.updateCurrentProject(p => ({
      ...p,
      generalTools: (p.generalTools || []).map(t => (t.id === toolId ? { ...t, ...updates } : t)),
    }));
  }

  removeGeneralTool(toolId: string): void {
    this.updateCurrentProject(p => ({
      ...p,
      generalTools: (p.generalTools || []).filter(t => t.id !== toolId),
    }));
  }

  // Master Ingredients
  addMasterIngredient(data: { name: string; unit: string; category: string }): void {
    this.updateCurrentProject(p => ({
      ...p,
      masterIngredients: [...(p.masterIngredients || []), { id: generateId(), ...data }],
    }));
  }

  updateMasterIngredient(id: string, updates: { name: string; unit: string; category: string }): void {
    this.updateCurrentProject(p => {
      const oldMi = p.masterIngredients.find(mi => mi.id === id);
      return {
        ...p,
        masterIngredients: p.masterIngredients.map(mi => (mi.id === id ? { ...mi, ...updates } : mi)),
        dishes: p.dishes.map(dish => ({
          ...dish,
          ingredients: dish.ingredients.map(ing =>
            ing.name === oldMi?.name
              ? { ...ing, name: updates.name, unit: updates.unit, category: updates.category }
              : ing
          ),
          generalIngredients: (dish.generalIngredients || []).map(gi =>
            gi.name === oldMi?.name
              ? { ...gi, name: updates.name, category: updates.category }
              : gi
          ),
        })),
      };
    });
  }

  removeMasterIngredient(id: string): void {
    this.updateCurrentProject(p => ({
      ...p,
      masterIngredients: p.masterIngredients.filter(mi => mi.id !== id),
    }));
  }

  // Shopping List State
  updateBoughtAmount(key: string, amount: number): void {
    this.updateCurrentProject(p => ({
      ...p,
      shoppingListState: {
        ...(p.shoppingListState || { boughtAmounts: {}, stores: {}, boughtGeneralIngredients: {} }),
        boughtAmounts: { ...(p.shoppingListState?.boughtAmounts || {}), [key]: amount },
      },
    }));
  }

  updateStore(key: string, store: string): void {
    this.updateCurrentProject(p => ({
      ...p,
      shoppingListState: {
        ...(p.shoppingListState || { boughtAmounts: {}, stores: {}, boughtGeneralIngredients: {} }),
        stores: { ...(p.shoppingListState?.stores || {}), [key]: store },
      },
    }));
  }

  toggleGeneralIngredientBought(name: string): void {
    this.updateCurrentProject(p => {
      const current = !!(p.shoppingListState?.boughtGeneralIngredients || {})[name];
      return {
        ...p,
        shoppingListState: {
          ...(p.shoppingListState || { boughtAmounts: {}, stores: {}, boughtGeneralIngredients: {} }),
          boughtGeneralIngredients: {
            ...(p.shoppingListState?.boughtGeneralIngredients || {}),
            [name]: !current,
          },
        },
      };
    });
  }

  updateShoppingListItem(key: string, boughtAmount: number, store: string): void {
    this.updateCurrentProject(p => ({
      ...p,
      shoppingListState: {
        ...(p.shoppingListState || { boughtAmounts: {}, stores: {}, boughtGeneralIngredients: {} }),
        stores: { ...(p.shoppingListState?.stores || {}), [key]: store },
        boughtAmounts: { ...(p.shoppingListState?.boughtAmounts || {}), [key]: boughtAmount },
      },
    }));
  }

  addLinkToDish(dishId: string, link: string): void {
    this.updateCurrentProject(p => ({
      ...p,
      dishes: p.dishes.map(d =>
        d.id === dishId ? { ...d, links: [...(d.links || []), link] } : d
      ),
    }));
  }

  removeLinkFromDish(dishId: string, index: number): void {
    this.updateCurrentProject(p => ({
      ...p,
      dishes: p.dishes.map(d => {
        if (d.id !== dishId) return d;
        const newLinks = [...(d.links || [])];
        newLinks.splice(index, 1);
        return { ...d, links: newLinks };
      }),
    }));
  }
}
