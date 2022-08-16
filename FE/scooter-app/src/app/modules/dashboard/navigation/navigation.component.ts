import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { DialogOverviewExampleDialog } from '../scooter-add/scooter-add.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogOverviewExample as DialogAddScooter } from '../scooter-add/scooter-add.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
  menu: number = 0;
  menuString = [
    'Dashboard',
    'Customer data',
    'Scooter data',
    'Trips data',
    'View scooters',
  ];
  dialogAddScooter: DialogAddScooter = new DialogAddScooter(this.dialog);

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog
  ) {}

  showDashboard() {
    this.menu = 0;
  }
  showCustomers() {
    this.menu = 1;
  }

  showScooters() {
    this.menu = 2;
  }

  showTrips() {
    this.menu = 3;
  }

  showMaps() {
    this.menu = 4;
  }
}
