import { Component, inject, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProjectService } from '../../services/project.service';
import { CalculationService, GroupBy, formatDate } from '../../services/calculation.service';

@Component({
  selector: 'app-lager-tab',
  imports: [ButtonModule, CardModule],
  templateUrl: './lager-tab.component.html',
})
export class LagerTabComponent {
  protected readonly projectService = inject(ProjectService);
  protected readonly calculationService = inject(CalculationService);

  readonly groupOptions: { id: GroupBy; label: string }[] = [
    { id: 'category', label: 'Kategorie' },
    { id: 'day', label: 'Tag' },
    { id: 'dish', label: 'Gericht' },
    { id: 'store', label: 'Laden' },
  ];

  readonly lagerList = computed(() => this.calculationService.lagerList());
}
