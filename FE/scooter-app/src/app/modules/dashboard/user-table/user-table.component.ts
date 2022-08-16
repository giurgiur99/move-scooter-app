import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CustomerElement } from 'src/app/shared/models/customerElement';
import { AdministratorService } from 'src/app/shared/services/administrator.service';
import { CustomerService } from 'src/app/shared/services/customers.service';
import { saveAs } from 'file-saver';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: '.app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
})
export class UserTableComponent implements OnInit {
  displayedColumns: string[] = [
    'email',
    'username',
    'drivingLicense',
    'numberOfTrips',
    'status',
    'suspend',
    'joinedDate',
  ];
  dataSource: MatTableDataSource<CustomerElement>;

  paginator: MatPaginator;

  usersNo: number = 0;
  pageSize: number;
  pageNo: number;

  constructor(
    private customerService: CustomerService,
    private administratorService: AdministratorService
  ) {}

  async ngOnInit() {
    this.usersNo = await this.queryNoOfUsers();
    await this.refreshTab(0, 5);
    this.pageNo = 0;
    this.dataSource.paginator = this.paginator;
    window.localStorage.setItem('start', String(0));
    window.localStorage.setItem('length', String(5));
  }

  async refreshTab(start: number, length: number) {
    const users = await this.queryUsers(start, length);
    this.dataSource = new MatTableDataSource(users);
  }

  async pageEvents(event: any) {
    await this.refreshTab(event.pageIndex * event.pageSize, 5);
    window.localStorage.setItem(
      'start',
      String(event.pageIndex * event.pageSize)
    );
    window.localStorage.setItem('length', String(5));
    // console.log(event.pageIndex);
    // console.log(event.pageSize);
  }

  async queryUsers(start: number, length: number) {
    try {
      const users = await this.administratorService.getUsers(start, length);
      return users;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async queryNoOfUsers() {
    try {
      const usersNo = await this.administratorService.getNoOfUsers();
      return usersNo;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  async downloadPic(element: string) {
    const path = JSON.parse(JSON.stringify(element)).drivingLicense;
    const data = await this.customerService.downloadPhoto(path);
    const link: string = JSON.parse(JSON.stringify(data)).path;
    console.log(path);
    saveAs(link, 'driving-license.png');
  }

  async getLink(element: string) {
    const path = JSON.parse(JSON.stringify(element)).drivingLicense;
    const data = await this.customerService.downloadPhoto(path);
    const link: string = JSON.parse(JSON.stringify(data)).path;
    console.log(link);
    return link;
  }

  async suspendUser(element: string) {
    const username = JSON.parse(JSON.stringify(element)).username;
    console.log(await this.customerService.suspendUser(username));
    const start = Number(window.localStorage.getItem('start'));
    const length = Number(window.localStorage.getItem('length'));
    this.refreshTab(start, length);
    console.log(start, length);
  }

  async unsuspendUser(element: string) {
    const username = JSON.parse(JSON.stringify(element)).username;
    console.log(await this.customerService.unsuspendUser(username));
    const start = Number(window.localStorage.getItem('start'));
    const length = Number(window.localStorage.getItem('length'));
    console.log(start, length);
    this.refreshTab(start, length);
  }
}
