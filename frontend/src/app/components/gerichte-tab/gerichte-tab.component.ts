import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { ProjectService } from '../../services/project.service';
import { DishEditorComponent } from '../dish-editor/dish-editor.component';

@Component({
  selector: 'app-gerichte-tab',
  imports: [
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    TextareaModule,
    DishEditorComponent,
  ],
  templateUrl: './gerichte-tab.component.html',
})
export class GerichteTabComponent {
  protected readonly projectService = inject(ProjectService);

  showAddDishDialog = signal(false);
  dishFormData = { name: '', baseServings: 1, isFixedAmount: false, notes: '' };

  dishes = computed(() => this.projectService.currentProject()?.dishes ?? []);

  editingDish = computed(() => {
    const id = this.projectService.editingDishId();
    return id ? this.dishes().find(d => d.id === id) ?? null : null;
  });

  openAddDishDialog(): void {
    this.dishFormData = { name: '', baseServings: 1, isFixedAmount: false, notes: '' };
    this.showAddDishDialog.set(true);
  }

  saveNewDish(): void {
    if (!this.dishFormData.name.trim()) return;
    this.projectService.addDish({
      name: this.dishFormData.name,
      baseServings: this.dishFormData.baseServings,
      isFixedAmount: this.dishFormData.isFixedAmount,
      notes: this.dishFormData.notes,
    });
    this.showAddDishDialog.set(false);
  }
}
