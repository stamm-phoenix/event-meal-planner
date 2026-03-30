import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-selection',
  imports: [ButtonModule, InputTextModule, FormsModule],
  templateUrl: './project-selection.component.html',
})
export class ProjectSelectionComponent {
  protected readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);

  createProject(): void {
    const project = this.projectService.createProject();
    this.router.navigate(['/project', project.id]);
  }

  openProject(id: string): void {
    this.projectService.selectProject(id);
    this.router.navigate(['/project', id]);
  }

  deleteProject(event: Event, id: string): void {
    event.stopPropagation();
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Bist du sicher, dass du dieses Projekt löschen möchtest?',
      header: 'Projekt löschen',
      icon: 'pi pi-trash',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.projectService.deleteProject(id),
    });
  }
}
