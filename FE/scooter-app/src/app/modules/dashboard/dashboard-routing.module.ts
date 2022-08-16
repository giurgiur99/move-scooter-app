import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPanelComponent } from './main-panel/main-panel.component';
import { NavigationComponent } from './navigation/navigation.component';
import { ScooterTableComponent } from './scooter-table/scooter-table.component';
import { SummaryComponent } from './summary/summary.component';
import { UserTableComponent } from './user-table/user-table.component';

const routes: Routes = [
  // { path: '', component: SummaryComponent },
  // {
  //   path: 'users',
  //   component: UserTableComponent,
  // },
  // {
  //   path: 'scooters',
  //   component: ScooterTableComponent,
  // },
  // {
  //   path: 'test',
  //   component: NavigationComponent,
  // },
  {
    path: '',
    component: NavigationComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardRoutingModule {}
