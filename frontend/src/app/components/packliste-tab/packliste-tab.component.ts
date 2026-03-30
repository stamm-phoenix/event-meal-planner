import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';
import { ProjectService } from '../../services/project.service';
import { CalculationService } from '../../services/calculation.service';
import { Tool } from '../../models/project.model';

@Component({
  selector: 'app-packliste-tab',
  imports: [FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './packliste-tab.component.html',
})
export class PacklisteTabComponent {
  protected readonly projectService = inject(ProjectService);
  private readonly calculationService = inject(CalculationService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly generalTools = computed(() => this.projectService.currentProject()?.generalTools ?? []);
  readonly packliste = computed(() => this.calculationService.packliste());

  showToolDialog = signal(false);
  editingToolId: string | null = null;
  toolFormData = { name: '', responsiblePerson: '' };

  isMine(person: string): boolean {
    const userName = this.projectService.userName();
    return !!userName && person === userName;
  }

  openAddToolDialog() {
    this.editingToolId = null;
    this.toolFormData = { name: '', responsiblePerson: '' };
    this.showToolDialog.set(true);
  }

  openEditToolDialog(tool: Tool) {
    this.editingToolId = tool.id;
    this.toolFormData = { name: tool.name, responsiblePerson: tool.responsiblePerson };
    this.showToolDialog.set(true);
  }

  saveTool() {
    if (this.editingToolId) {
      this.projectService.updateGeneralTool(this.editingToolId, this.toolFormData);
    } else {
      this.projectService.addGeneralTool(this.toolFormData);
    }
    this.showToolDialog.set(false);
  }

  deleteTool(id: string) {
    this.confirmationService.confirm({
      message: 'Bist du sicher, dass du dieses allgemeine Werkzeug löschen möchtest?',
      header: 'Werkzeug löschen',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.projectService.removeGeneralTool(id),
    });
  }
}
