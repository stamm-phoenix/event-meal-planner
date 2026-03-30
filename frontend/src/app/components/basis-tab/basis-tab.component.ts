import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ProjectService } from '../../services/project.service';
import { formatDate } from '../../services/calculation.service';

@Component({
  selector: 'app-basis-tab',
  imports: [FormsModule, DialogModule, InputTextModule, InputNumberModule, ButtonModule],
  templateUrl: './basis-tab.component.html',
})
export class BasisTabComponent {
  protected readonly projectService = inject(ProjectService);

  showProjectDialog = signal(false);
  showSubgroupDialog = signal(false);
  showDeleteDialog = signal(false);
  editingSubgroupId = signal<string | null>(null);
  deletingSubgroupId = signal<string | null>(null);

  projectForm = signal({ name: '', totalPeople: 0, startDate: '', endDate: '' });
  subgroupForm = signal({ name: '', count: 0 });

  formatDate = formatDate;

  openProjectDialog(): void {
    const project = this.projectService.currentProject();
    if (!project) return;
    this.projectForm.set({
      name: project.name,
      totalPeople: project.totalPeople,
      startDate: project.startDate ?? '',
      endDate: project.endDate ?? '',
    });
    this.showProjectDialog.set(true);
  }

  saveProject(): void {
    const form = this.projectForm();
    this.projectService.updateProjectDetails({
      name: form.name,
      totalPeople: form.totalPeople,
    });
    if (form.startDate && form.endDate) {
      this.projectService.updateProjectDates(form.startDate, form.endDate);
    }
    this.showProjectDialog.set(false);
  }

  openAddSubgroupDialog(): void {
    this.editingSubgroupId.set(null);
    this.subgroupForm.set({ name: '', count: 0 });
    this.showSubgroupDialog.set(true);
  }

  openEditSubgroupDialog(id: string): void {
    const project = this.projectService.currentProject();
    if (!project) return;
    const sg = project.subgroups.find(s => s.id === id);
    if (!sg) return;
    this.editingSubgroupId.set(id);
    this.subgroupForm.set({ name: sg.name, count: sg.count });
    this.showSubgroupDialog.set(true);
  }

  saveSubgroup(): void {
    const form = this.subgroupForm();
    const editingId = this.editingSubgroupId();
    if (editingId) {
      this.projectService.updateSubgroup(editingId, { name: form.name, count: form.count });
    } else {
      this.projectService.addSubgroup({ name: form.name, count: form.count });
    }
    this.showSubgroupDialog.set(false);
  }

  openDeleteDialog(id: string): void {
    this.deletingSubgroupId.set(id);
    this.showDeleteDialog.set(true);
  }

  confirmDelete(): void {
    const id = this.deletingSubgroupId();
    if (id) {
      this.projectService.removeSubgroup(id);
    }
    this.showDeleteDialog.set(false);
    this.deletingSubgroupId.set(null);
  }
}
