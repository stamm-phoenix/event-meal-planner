import { computed, Injectable, inject, signal } from '@angular/core';
import { ProjectService } from './project.service';
import {
  GeneralShoppingItem,
  LagerGroup,
  LagerItem,
  PackGroup,
  PackItem,
  ShoppingItem,
} from '../models/project.model';

export type GroupBy = 'category' | 'day' | 'dish' | 'store';

@Injectable({ providedIn: 'root' })
export class CalculationService {
  private projectService = inject(ProjectService);

  readonly groupBy = signal<GroupBy>('category');
  readonly lagerGroupBy = signal<GroupBy>('category');
  readonly hideCompleted = signal(false);

  readonly shoppingList = computed<ShoppingItem[]>(() => {
    const project = this.projectService.currentProject();
    if (!project) return [];
    const mainGroupCount = this.projectService.mainGroupCount();
    const groupBy = this.groupBy();
    const hideCompleted = this.hideCompleted();

    const items: ShoppingItem[] = [];

    const sortedBlocks = [...project.mealBlocks].sort((a, b) => {
      const dayA = project.days.indexOf(a.day);
      const dayB = project.days.indexOf(b.day);
      if (dayA !== dayB) return dayA - dayB;
      return a.time.localeCompare(b.time);
    });

    const availableBought = { ...(project.shoppingListState?.boughtAmounts || {}) };

    sortedBlocks.forEach(block => {
      const dishAssignments: Record<string, number> = {};

      const mainDishIds = Array.isArray(block.mainDishIds) ? block.mainDishIds : [];
      mainDishIds.forEach(dishId => {
        dishAssignments[dishId] = (dishAssignments[dishId] || 0) + mainGroupCount;
      });

      (project.subgroups || []).forEach(sg => {
        const specificDishIds = (block.subgroupDishes || {})[sg.id];
        const finalDishIds =
          Array.isArray(specificDishIds) && specificDishIds.length > 0
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
          const store =
            (project.shoppingListState?.stores || {})[`${ing.name}-${ing.unit}`] || 'Unbekannt';

          const key = `${ing.name}-${ing.unit}`;
          const allocated = Math.min(totalAmount, availableBought[key] || 0);
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
              store,
              sources: [
                dish.isFixedAmount
                  ? `${dish.name} (${formatDate(block.day)} ${block.time}): Fixe Menge (${ing.amountPerPerson}${ing.unit})`
                  : `${dish.name} (${formatDate(block.day)} ${block.time}): (${ing.amountPerPerson}${ing.unit} / ${dish.baseServings} Pers.) * ${count} Pers.`,
              ],
            });
          }
        });

        (dish.generalIngredients || []).forEach(gi => {
          if (!block.isCompleted) {
            const isBought = !!(project.shoppingListState?.boughtGeneralIngredients || {})[gi.name];
            items.push({
              name: gi.name,
              amount: 0,
              boughtAmount: isBought ? 1 : 0,
              unit: '',
              category: gi.category,
              day: block.day,
              dishName: dish.name,
              store: 'Gewürze',
              sources: [`${dish.name} (${formatDate(block.day)} ${block.time})`],
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
        if (item.amount > 0) {
          grouped[groupKey].amount += item.amount;
          grouped[groupKey].boughtAmount += item.boughtAmount;
        } else {
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
  });

  readonly lagerList = computed<LagerGroup[]>(() => {
    const project = this.projectService.currentProject();
    if (!project) return [];
    const mainGroupCount = this.projectService.mainGroupCount();
    const lagerGroupBy = this.lagerGroupBy();

    const availableBought = { ...(project.shoppingListState?.boughtAmounts || {}) };

    const sortedBlocks = [...project.mealBlocks].sort((a, b) => {
      const dayA = project.days.indexOf(a.day);
      const dayB = project.days.indexOf(b.day);
      if (dayA !== dayB) return dayA - dayB;
      return a.time.localeCompare(b.time);
    });

    const items: LagerItem[] = [];

    const getDishAssignments = (block: typeof sortedBlocks[0]): Record<string, number> => {
      const assignments: Record<string, number> = {};
      const mainDishIds = Array.isArray(block.mainDishIds) ? block.mainDishIds : [];
      mainDishIds.forEach(dishId => {
        assignments[dishId] = (assignments[dishId] || 0) + mainGroupCount;
      });
      (project.subgroups || []).forEach(sg => {
        const specificDishIds = (block.subgroupDishes || {})[sg.id];
        const finalDishIds =
          Array.isArray(specificDishIds) && specificDishIds.length > 0
            ? specificDishIds
            : mainDishIds;
        finalDishIds.forEach(dishId => {
          assignments[dishId] = (assignments[dishId] || 0) + sg.count;
        });
      });
      return assignments;
    };

    // Pass 1: Consume stock for completed blocks
    sortedBlocks
      .filter(b => b.isCompleted)
      .forEach(block => {
        const assignments = getDishAssignments(block);
        Object.entries(assignments).forEach(([dishId, count]) => {
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

    // Pass 2: Allocate remaining stock to future blocks
    sortedBlocks
      .filter(b => !b.isCompleted)
      .forEach(block => {
        const assignments = getDishAssignments(block);
        Object.entries(assignments).forEach(([dishId, count]) => {
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
                store,
              });
              availableBought[key] = Math.max(0, (availableBought[key] || 0) - allocated);
            }
          });
        });
      });

    // Pass 3: Surplus
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
          store,
        });
      }
    });

    // Group
    const grouped: Record<string, LagerItem[]> = {};
    items.forEach(item => {
      let groupKey = '';
      if (lagerGroupBy === 'category') groupKey = item.category;
      else if (lagerGroupBy === 'day') groupKey = item.day;
      else if (lagerGroupBy === 'dish') groupKey = item.dishName;
      else if (lagerGroupBy === 'store') groupKey = item.store;

      if (!grouped[groupKey]) grouped[groupKey] = [];

      const existing = grouped[groupKey].find(i => i.name === item.name && i.unit === item.unit);
      if (existing) {
        existing.amount += item.amount;
      } else {
        grouped[groupKey].push({ ...item });
      }
    });

    return Object.entries(grouped)
      .map(([group, groupItems]) => ({
        group,
        items: groupItems.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.group.localeCompare(b.group));
  });

  readonly generalShoppingList = computed<GeneralShoppingItem[]>(() => {
    const project = this.projectService.currentProject();
    if (!project) return [];

    const needed = new Set<string>();
    const giMap: Record<string, { category: string }> = {};

    project.mealBlocks.forEach(block => {
      const dishIds = [
        ...(Array.isArray(block.mainDishIds) ? block.mainDishIds : []),
        ...Object.values(block.subgroupDishes || {}).flat(),
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

    return Array.from(needed)
      .map(name => ({
        name,
        category: giMap[name].category,
        isBought: !!(project.shoppingListState?.boughtGeneralIngredients || {})[name],
      }))
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  });

  readonly packliste = computed<PackGroup[]>(() => {
    const project = this.projectService.currentProject();
    if (!project) return [];

    const items: PackItem[] = [];

    (project.generalTools || []).forEach(t => {
      items.push({
        name: t.name,
        responsiblePerson: t.responsiblePerson || 'Unbekannt',
        source: 'Allgemein',
      });
    });

    project.mealBlocks.forEach(block => {
      const dishIds = [
        ...(Array.isArray(block.mainDishIds) ? block.mainDishIds : []),
        ...Object.values(block.subgroupDishes || {}).flat(),
      ];
      dishIds.forEach(id => {
        const dish = project.dishes.find(d => d.id === id);
        if (dish) {
          (dish.tools || []).forEach(t => {
            items.push({
              name: t.name,
              responsiblePerson: t.responsiblePerson || 'Unbekannt',
              source: dish.name,
            });
          });
        }
      });
    });

    const grouped: Record<string, PackItem[]> = {};
    items.forEach(item => {
      const person = item.responsiblePerson;
      if (!grouped[person]) grouped[person] = [];
      if (!grouped[person].find(i => i.name === item.name && i.source === item.source)) {
        grouped[person].push(item);
      }
    });

    return Object.entries(grouped)
      .map(([person, groupItems]) => ({
        person,
        items: groupItems.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.person.localeCompare(b.person));
  });
}

export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });
  } catch {
    return dateStr;
  }
}
