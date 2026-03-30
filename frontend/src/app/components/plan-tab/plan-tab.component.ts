import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProjectService } from '../../services/project.service';
import { formatDate } from '../../services/calculation.service';
import { MealBlock } from '../../models/project.model';
import { MealBlockCardComponent } from '../meal-block-card/meal-block-card.component';

@Component({
  selector: 'app-plan-tab',
  imports: [FormsModule, DialogModule, ButtonModule, MealBlockCardComponent],
  templateUrl: './plan-tab.component.html',
})
export class PlanTabComponent {
  protected readonly projectService = inject(ProjectService);
  protected readonly formatDate = formatDate;

  showMealDialog = signal(false);
  editingBlockId = signal<string | null>(null);
  mealForm = signal({ day: '', time: '12:00', label: '', responsiblePerson: '' });

  getMealBlocksForDay(day: string): MealBlock[] {
    const project = this.projectService.currentProject();
    if (!project) return [];
    return project.mealBlocks
      .filter(b => b.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  openAddMealDialog(day: string): void {
    this.editingBlockId.set(null);
    this.mealForm.set({ day, time: '12:00', label: '', responsiblePerson: '' });
    this.showMealDialog.set(true);
  }

  openEditMealDialog(block: MealBlock): void {
    this.editingBlockId.set(block.id);
    this.mealForm.set({
      day: block.day,
      time: block.time,
      label: block.label,
      responsiblePerson: block.responsiblePerson ?? '',
    });
    this.showMealDialog.set(true);
  }

  saveMeal(): void {
    const form = this.mealForm();
    const editId = this.editingBlockId();

    if (editId) {
      this.projectService.updateMealBlock(editId, {
        time: form.time,
        label: form.label,
        responsiblePerson: form.responsiblePerson,
      });
    } else {
      this.projectService.addMealBlock({
        day: form.day,
        time: form.time,
        label: form.label,
        responsiblePerson: form.responsiblePerson,
      });
    }

    this.showMealDialog.set(false);
  }
}
