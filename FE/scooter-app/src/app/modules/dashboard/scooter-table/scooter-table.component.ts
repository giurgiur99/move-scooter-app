import {
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Scooter } from 'src/app/shared/models/scooter';
import { ScooterService } from 'src/app/shared/services/scooter.services';
import { DialogOverviewExample as DialogAddScooter } from '../scooter-add/scooter-add.component';

@Component({
  selector: '.app-scooter-table',
  templateUrl: './scooter-table.component.html',
  styleUrls: ['./scooter-table.component.scss'],
})
export class ScooterTableComponent implements OnInit {
  dialogAddScooter: DialogAddScooter = new DialogAddScooter(this.dialog);
  displayedColumns: string[] = [
    'number',
    'battery',
    'booked',
    'locked',
    'internalId',
    'status',
    'suspend',
    'last seen',
    //'coordinates',
  ];
  dataSource: MatTableDataSource<Scooter>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private scooterService: ScooterService,
    private dialog: MatDialog
  ) {}

  showAddScooter() {
    this.dialogAddScooter.openDialog();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async refreshTab() {
    try {
      const scooters = await this.scooterService.findAll();
      this.dataSource = new MatTableDataSource(scooters);
      this.dataSource.paginator = this.paginator;
    } catch (err) {
      console.log(err);
    }
  }

  async ngOnInit() {
    this.refreshTab();
  }

  async suspendScooter(element: string) {
    try {
      const internalId = JSON.parse(JSON.stringify(element)).internalId;
      await this.scooterService.suspend(internalId);
    } catch (err) {
      console.log(err);
    }
    this.refreshTab();
  }

  async unsuspendScooter(element: string) {
    try {
      const internalId = JSON.parse(JSON.stringify(element)).internalId;
      await this.scooterService.unsuspend(internalId);
    } catch (err) {
      console.log(err);
    }
    this.refreshTab();
  }
}
