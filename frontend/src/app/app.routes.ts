import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/project-selection/project-selection.component').then(
        m => m.ProjectSelectionComponent
      ),
  },
  {
    path: 'project/:id',
    loadComponent: () =>
      import('./components/project-editor/project-editor.component').then(
        m => m.ProjectEditorComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
