import { Component, inject, input, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { ProjectService } from '../../services/project.service';
import { Dish, Ingredient, Tool, GeneralIngredient, MasterIngredient } from '../../models/project.model';

@Component({
  selector: 'app-dish-editor',
  imports: [
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    AutoCompleteModule,
    CheckboxModule,
    TextareaModule,
  ],
  templateUrl: './dish-editor.component.html',
})
export class DishEditorComponent {
  protected readonly projectService = inject(ProjectService);

  dish = input.required<Dish>();

  // Dish edit dialog
  showDishDialog = signal(false);
  dishFormData = { name: '', baseServings: 1, isFixedAmount: false };

  // Notes edit dialog
  showNotesDialog = signal(false);
  notesFormData = '';

  // Delete confirmation dialog
  showDeleteDialog = signal(false);

  // Ingredient dialog
  showIngredientDialog = signal(false);
  editingIngredientId: string | null = null;
  ingredientFormData = { name: '', amountPerPerson: 0, unit: 'g', category: 'Sonstiges' };
  filteredIngredientResults: MasterIngredient[] = [];

  // Tool dialog
  showToolDialog = signal(false);
  editingToolId: string | null = null;
  toolFormData = { name: '', responsiblePerson: '' };

  // General Ingredient dialog
  showGeneralIngredientDialog = signal(false);
  editingGeneralIngredientId: string | null = null;
  generalIngredientFormData = { name: '', category: 'Gewürze' };

  // --- Dish editing ---

  openEditDishDialog(): void {
    const d = this.dish();
    this.dishFormData = { name: d.name, baseServings: d.baseServings, isFixedAmount: d.isFixedAmount ?? false };
    this.showDishDialog.set(true);
  }

  saveDish(): void {
    this.projectService.updateDish(this.dish().id, {
      name: this.dishFormData.name,
      baseServings: this.dishFormData.baseServings,
      isFixedAmount: this.dishFormData.isFixedAmount,
    });
    this.showDishDialog.set(false);
  }

  openNotesDialog(): void {
    this.notesFormData = this.dish().notes ?? '';
    this.showNotesDialog.set(true);
  }

  saveNotes(): void {
    this.projectService.updateDish(this.dish().id, { notes: this.notesFormData });
    this.showNotesDialog.set(false);
  }

  openDeleteDialog(): void {
    this.showDeleteDialog.set(true);
  }

  confirmDelete(): void {
    this.projectService.removeDish(this.dish().id);
    this.showDeleteDialog.set(false);
  }

  // --- Links ---

  onLinkKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const input = event.target as HTMLInputElement;
      if (input.value.trim()) {
        this.projectService.addLinkToDish(this.dish().id, input.value.trim());
        input.value = '';
      }
    }
  }

  removeLink(index: number): void {
    this.projectService.removeLinkFromDish(this.dish().id, index);
  }

  // --- Ingredients ---

  openAddIngredientDialog(): void {
    this.editingIngredientId = null;
    this.ingredientFormData = { name: '', amountPerPerson: 0, unit: 'g', category: 'Sonstiges' };
    this.showIngredientDialog.set(true);
  }

  openEditIngredientDialog(ing: Ingredient): void {
    this.editingIngredientId = ing.id;
    this.ingredientFormData = { name: ing.name, amountPerPerson: ing.amountPerPerson, unit: ing.unit, category: ing.category };
    this.showIngredientDialog.set(true);
  }

  saveIngredient(): void {
    if (this.editingIngredientId) {
      this.projectService.updateIngredientInDish(this.dish().id, this.editingIngredientId, this.ingredientFormData);
    } else {
      this.projectService.addIngredientToDish(this.dish().id, this.ingredientFormData);
    }
    this.showIngredientDialog.set(false);
  }

  removeIngredient(id: string): void {
    this.projectService.removeIngredientFromDish(this.dish().id, id);
  }

  filterIngredients(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    const project = this.projectService.currentProject();
    if (!project) return;
    this.filteredIngredientResults = (project.masterIngredients || [])
      .filter(mi => mi.name.toLowerCase().includes(query));
  }

  onIngredientSelected(event: { value: MasterIngredient }): void {
    this.ingredientFormData.name = event.value.name;
    this.ingredientFormData.unit = event.value.unit;
    this.ingredientFormData.category = event.value.category;
  }

  // --- Tools ---

  openAddToolDialog(): void {
    this.editingToolId = null;
    this.toolFormData = { name: '', responsiblePerson: '' };
    this.showToolDialog.set(true);
  }

  openEditToolDialog(tool: Tool): void {
    this.editingToolId = tool.id;
    this.toolFormData = { name: tool.name, responsiblePerson: tool.responsiblePerson };
    this.showToolDialog.set(true);
  }

  saveTool(): void {
    if (this.editingToolId) {
      this.projectService.updateToolInDish(this.dish().id, this.editingToolId, this.toolFormData);
    } else {
      this.projectService.addToolToDish(this.dish().id, this.toolFormData);
    }
    this.showToolDialog.set(false);
  }

  removeTool(id: string): void {
    this.projectService.removeToolFromDish(this.dish().id, id);
  }

  // --- General Ingredients ---

  openAddGeneralIngredientDialog(): void {
    this.editingGeneralIngredientId = null;
    this.generalIngredientFormData = { name: '', category: 'Gewürze' };
    this.showGeneralIngredientDialog.set(true);
  }

  openEditGeneralIngredientDialog(gi: GeneralIngredient): void {
    this.editingGeneralIngredientId = gi.id;
    this.generalIngredientFormData = { name: gi.name, category: gi.category };
    this.showGeneralIngredientDialog.set(true);
  }

  saveGeneralIngredient(): void {
    if (this.editingGeneralIngredientId) {
      this.projectService.updateGeneralIngredientInDish(this.dish().id, this.editingGeneralIngredientId, this.generalIngredientFormData);
    } else {
      this.projectService.addGeneralIngredientToDish(this.dish().id, this.generalIngredientFormData);
    }
    this.showGeneralIngredientDialog.set(false);
  }

  removeGeneralIngredient(id: string): void {
    this.projectService.removeGeneralIngredientFromDish(this.dish().id, id);
  }
}
