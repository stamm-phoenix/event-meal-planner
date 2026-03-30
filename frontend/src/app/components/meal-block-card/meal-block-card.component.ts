import { Component, inject, input, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProjectService } from '../../services/project.service';
import { MealBlock, Dish } from '../../models/project.model';

@Component({
  selector: 'app-meal-block-card',
  imports: [FormsModule, AutoCompleteModule, ButtonModule, DialogModule],
  templateUrl: './meal-block-card.component.html',
})
export class MealBlockCardComponent {
  protected readonly projectService = inject(ProjectService);

  block = input.required<MealBlock>();

  // Main dish autocomplete
  dishSearchText = signal('');
  filteredDishResults = signal<Dish[]>([]);
  filteredDishes = computed(() => this.filteredDishResults());

  // Subgroup dish autocomplete (keyed by subgroup id)
  subgroupDishSearchText: Record<string, string> = {};
  subgroupFilteredResults = signal<Record<string, Dish[]>>({});

  // Edit dialog
  showEditDialog = signal(false);
  editForm = signal({ time: '', label: '', responsiblePerson: '' });

  isMine = computed(() => {
    const userName = this.projectService.userName();
    return !!userName && this.block().responsiblePerson === userName;
  });

  subgroups = computed(() => this.projectService.currentProject()?.subgroups ?? []);

  getDishName(dishId: string): string {
    const project = this.projectService.currentProject();
    return project?.dishes.find(d => d.id === dishId)?.name ?? 'Unbekannt';
  }

  getSubgroupDishIds(subgroupId: string): string[] {
    return this.block().subgroupDishes?.[subgroupId] ?? [];
  }

  getBlockClasses(): string {
    const base = 'group relative p-4 rounded-xl border transition-all';
    if (this.block().isCompleted) {
      return `${base} border-green-300 bg-green-50 opacity-60`;
    }
    return `${base} border-[#141414]/10 bg-[#FAFAF8] hover:border-[#141414]/30`;
  }

  // Main dish filtering
  filterDishes(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    const project = this.projectService.currentProject();
    if (!project) return;
    this.filteredDishResults.set(
      project.dishes.filter(d => d.name.toLowerCase().includes(query))
    );
  }

  onDishSelected(event: { value: Dish }, blockId: string, subgroupId?: string): void {
    this.projectService.addDishToBlock(blockId, event.value.id, undefined, subgroupId);
    if (subgroupId) {
      this.subgroupDishSearchText[subgroupId] = '';
    } else {
      this.dishSearchText.set('');
    }
  }

  // Subgroup dish filtering
  filterSubgroupDishes(event: AutoCompleteCompleteEvent, subgroupId: string): void {
    const query = event.query.toLowerCase();
    const project = this.projectService.currentProject();
    if (!project) return;
    const filtered = project.dishes.filter(d => d.name.toLowerCase().includes(query));
    this.subgroupFilteredResults.update(prev => ({ ...prev, [subgroupId]: filtered }));
  }

  getSubgroupFilteredDishes(subgroupId: string): Dish[] {
    return this.subgroupFilteredResults()[subgroupId] ?? [];
  }

  getSubgroupSearchText(subgroupId: string): string {
    return this.subgroupDishSearchText[subgroupId] ?? '';
  }

  setSubgroupSearchText(subgroupId: string, value: string): void {
    this.subgroupDishSearchText[subgroupId] = value;
  }

  // Dish removal
  removeDish(index: number): void {
    this.projectService.removeDishFromBlock(this.block().id, index);
  }

  removeSubgroupDish(subgroupId: string, index: number): void {
    this.projectService.removeDishFromBlock(this.block().id, index, subgroupId);
  }

  // Toggle complete
  toggleComplete(): void {
    this.projectService.toggleMealBlockCompleted(this.block().id);
  }

  // Delete
  deleteBlock(): void {
    this.projectService.removeMealBlock(this.block().id);
  }

  // Edit dialog
  openEditDialog(): void {
    const b = this.block();
    this.editForm.set({ time: b.time, label: b.label, responsiblePerson: b.responsiblePerson ?? '' });
    this.showEditDialog.set(true);
  }

  saveEdit(): void {
    this.projectService.updateMealBlock(this.block().id, this.editForm());
    this.showEditDialog.set(false);
  }
}
