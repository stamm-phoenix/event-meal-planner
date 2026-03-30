import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ProjectService } from '../../services/project.service';
import { CalculationService, GroupBy, formatDate } from '../../services/calculation.service';
import { ShoppingItem } from '../../models/project.model';

@Component({
  selector: 'app-einkauf-tab',
  standalone: true,
  imports: [FormsModule, DialogModule, ButtonModule, InputTextModule, InputNumberModule, CheckboxModule],
  templateUrl: './einkauf-tab.component.html',
})
export class EinkaufTabComponent {
  readonly projectService = inject(ProjectService);
  readonly calculationService = inject(CalculationService);

  readonly groupOptions: { id: GroupBy; label: string }[] = [
    { id: 'category', label: 'Kategorie' },
    { id: 'day', label: 'Tag' },
    { id: 'dish', label: 'Gericht' },
    { id: 'store', label: 'Laden' },
  ];

  project = computed(() => this.projectService.currentProject());
  shoppingList = computed(() => this.calculationService.shoppingList());
  generalShoppingList = computed(() => this.calculationService.generalShoppingList());

  groups = computed(() => {
    const list = this.shoppingList();
    const groupBy = this.calculationService.groupBy();
    const groupSet = new Set<string>();
    list.forEach(i => {
      if (groupBy === 'category') groupSet.add(i.category);
      else if (groupBy === 'day') groupSet.add(i.day || '');
      else if (groupBy === 'dish') groupSet.add(i.dishName || '');
      else if (groupBy === 'store') groupSet.add(i.store || '');
    });
    return Array.from(groupSet);
  });

  getItemsForGroup(group: string): ShoppingItem[] {
    const list = this.shoppingList();
    const groupBy = this.calculationService.groupBy();
    return list.filter(i => {
      if (groupBy === 'category') return i.category === group;
      if (groupBy === 'day') return i.day === group;
      if (groupBy === 'dish') return i.dishName === group;
      if (groupBy === 'store') return i.store === group;
      return false;
    });
  }

  isDay(group: string): boolean {
    return this.calculationService.groupBy() === 'day' && !!group;
  }

  isFullyBought(item: ShoppingItem): boolean {
    return item.amount > 0 ? item.boughtAmount >= item.amount - 0.001 : item.boughtAmount === 1;
  }

  isPartiallyBought(item: ShoppingItem): boolean {
    return item.amount > 0 && item.boughtAmount > 0 && !this.isFullyBought(item);
  }

  getItemClasses(item: ShoppingItem): string {
    if (this.isFullyBought(item)) return 'bg-green-50/50 opacity-50 border-green-500/30';
    if (this.isPartiallyBought(item)) return 'bg-orange-50/50 border-orange-500/30';
    return 'bg-[#E4E3E0]/30 border-transparent hover:border-[#141414]';
  }

  getStore(item: ShoppingItem): string {
    const project = this.project();
    return (project?.shoppingListState?.stores || {})[`${item.name}-${item.unit}`] || '';
  }

  toggleBought(item: ShoppingItem) {
    const key = `${item.name}-${item.unit}`;
    const project = this.project();
    const totalBought = (project?.shoppingListState?.boughtAmounts || {})[key] || 0;
    const fully = this.isFullyBought(item);
    const missing = item.amount - item.boughtAmount;
    const newVal = fully ? Math.max(0, totalBought - item.amount) : totalBought + missing;
    this.projectService.updateBoughtAmount(key, newVal);
  }

  toggleGeneralBought(name: string) {
    this.projectService.toggleGeneralIngredientBought(name);
  }

  // Edit dialog
  showEditDialog = signal(false);
  editFormData = { key: '', name: '', unit: '', totalAmount: 0, boughtAmount: 0, store: '' };

  openEditItemDialog(item: ShoppingItem) {
    const key = `${item.name}-${item.unit}`;
    const store = this.getStore(item);
    this.editFormData = { key, name: item.name, unit: item.unit, totalAmount: item.amount, boughtAmount: item.boughtAmount, store };
    this.showEditDialog.set(true);
  }

  saveEditItem() {
    this.projectService.updateShoppingListItem(this.editFormData.key, this.editFormData.boughtAmount, this.editFormData.store);
    this.showEditDialog.set(false);
  }

  formatDate = formatDate;
}
