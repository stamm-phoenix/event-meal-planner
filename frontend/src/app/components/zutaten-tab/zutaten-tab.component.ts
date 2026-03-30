import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';
import { ProjectService } from '../../services/project.service';
import { MasterIngredient } from '../../models/project.model';

@Component({
  selector: 'app-zutaten-tab',
  standalone: true,
  imports: [FormsModule, DialogModule, ButtonModule, InputTextModule],
  providers: [ConfirmationService],
  templateUrl: './zutaten-tab.component.html',
})
export class ZutatenTabComponent {
  private readonly projectService = inject(ProjectService);
  private readonly confirmationService = inject(ConfirmationService);

  showDialog = signal(false);
  editingId: string | null = null;
  formData = { name: '', unit: 'g', category: 'Sonstiges' };

  sortedIngredients = computed(() => {
    const project = this.projectService.currentProject();
    return (project?.masterIngredients || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  });

  getUsage(mi: MasterIngredient) {
    const project = this.projectService.currentProject();
    return (project?.dishes || []).filter(d => d.ingredients.some(i => i.name === mi.name));
  }

  openAddDialog() {
    this.editingId = null;
    this.formData = { name: '', unit: 'g', category: 'Sonstiges' };
    this.showDialog.set(true);
  }

  openEditDialog(mi: MasterIngredient) {
    this.editingId = mi.id;
    this.formData = { name: mi.name, unit: mi.unit, category: mi.category };
    this.showDialog.set(true);
  }

  save() {
    if (this.editingId) {
      this.projectService.updateMasterIngredient(this.editingId, this.formData);
    } else {
      this.projectService.addMasterIngredient(this.formData);
    }
    this.showDialog.set(false);
  }

  deleteIngredient(mi: MasterIngredient) {
    const usage = this.getUsage(mi);
    if (usage.length > 0) {
      return;
    }
    this.confirmationService.confirm({
      message: 'Bist du sicher, dass du diese Zutat aus der zentralen Liste löschen möchtest?',
      header: 'Zutat löschen',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.projectService.removeMasterIngredient(mi.id),
    });
  }
}
