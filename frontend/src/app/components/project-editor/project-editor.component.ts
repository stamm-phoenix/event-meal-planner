import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { ProjectService, Tab } from '../../services/project.service';
import { CalculationService } from '../../services/calculation.service';
import { BasisTabComponent } from '../basis-tab/basis-tab.component';
import { PlanTabComponent } from '../plan-tab/plan-tab.component';
import { GerichteTabComponent } from '../gerichte-tab/gerichte-tab.component';
import { ZutatenTabComponent } from '../zutaten-tab/zutaten-tab.component';
import { EinkaufTabComponent } from '../einkauf-tab/einkauf-tab.component';
import { LagerTabComponent } from '../lager-tab/lager-tab.component';
import { PacklisteTabComponent } from '../packliste-tab/packliste-tab.component';

@Component({
  selector: 'app-project-editor',
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    TabsModule,
    BasisTabComponent,
    PlanTabComponent,
    GerichteTabComponent,
    ZutatenTabComponent,
    EinkaufTabComponent,
    LagerTabComponent,
    PacklisteTabComponent,
  ],
  templateUrl: './project-editor.component.html',
})
export class ProjectEditorComponent implements OnInit {
  protected readonly projectService = inject(ProjectService);
  protected readonly calculationService = inject(CalculationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'basis', label: 'Basisdaten', icon: 'pi-users' },
    { id: 'plan', label: 'Zeitplan', icon: 'pi-calendar' },
    { id: 'gerichte', label: 'Gerichte', icon: 'pi-list' },
    { id: 'zutaten', label: 'Zutaten', icon: 'pi-filter' },
    { id: 'einkauf', label: 'Einkaufsliste', icon: 'pi-shopping-cart' },
    { id: 'lager', label: 'Lager', icon: 'pi-box' },
    { id: 'packliste', label: 'Packliste', icon: 'pi-briefcase' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectService.selectProject(id);
    }
  }

  onTabChange(value: unknown): void {
    const tab = this.tabs.find(t => t.id === value);
    if (tab) {
      this.projectService.activeTab.set(tab.id);
    }
  }

  goBack(): void {
    this.projectService.selectProject(null);
    this.router.navigate(['/']);
  }
}
