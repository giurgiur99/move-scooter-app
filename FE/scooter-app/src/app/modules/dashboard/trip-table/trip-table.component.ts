import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Data } from '@angular/router';
import { Trip } from 'src/app/shared/models/trip';
import { ScooterService } from 'src/app/shared/services/scooter.services';
import { CoordinatesArray } from './coordinates.interface';

@Component({
  selector: '.app-trip-table',
  templateUrl: './trip-table.component.html',
  styleUrls: ['./trip-table.component.scss'],
})
export class TripTableComponent implements OnInit {
  displayedColumns: string[] = [
    'username',
    'scooterId',
    'totalTime',
    'distance',
    'price',
    'status',
    'startTime',
    'endTime',
    'details',
    //'coordinates',
  ];
  dataSource: MatTableDataSource<Trip>;

  noOfTrips: number = 0;

  constructor(
    private scooterService: ScooterService,
    public dialog: MatDialog
  ) {}

  paginator: MatPaginator;

  async ngOnInit() {
    try {
      this.noOfTrips = await this.scooterService.noOfTrips();

      await this.refreshTab(0, 5);
      this.dataSource.paginator = this.paginator;
    } catch (err) {
      console.log(err);
    }
  }

  async refreshTab(start: number, length: number) {
    const trips = await this.scooterService.trips(start, length);
    this.dataSource = new MatTableDataSource(trips);
  }

  async pageEvents(event: any) {
    await this.refreshTab(event.pageIndex * event.pageSize, 5);
  }

  onDetailsClick(trip: Trip) {
    this.openDialog(trip);
  }

  async openDialog(trip: Trip) {
    const dialogRef = this.dialog.open(TripDetails, {
      data: trip,
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
@Component({
  selector: 'trip-details',
  templateUrl: './trip-details.html',
  styleUrls: ['./trip-details.scss'],
})
export class TripDetails implements OnInit {
  @ViewChild(GoogleMap, { static: false }) GoogleMap: GoogleMap;
  mapType: google.maps.MapType;
  coordinates: { lat: number; lng: number }[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: Trip) {
    // console.log(data.coordinatesArray);
    data.coordinatesArray.forEach((data) => {
      console.log(data);
      let obj = { lat: data.latitude, lng: data.longitude };
      this.coordinates.push(obj);
      // console.log(obj);
    });
    console.log(this.coordinates);
  }
  async ngOnInit() {}

  optionsPolyline = {
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2,
  };

  polylineOptions = new google.maps.Polyline({
    path: this.coordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });

  styles: google.maps.MapTypeStyle[] = [
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }],
    },
  ];

  options: google.maps.MapOptions = {
    styles: this.styles,
    center: {
      lat: this.data.coordinatesArray[0].latitude,
      lng: this.data.coordinatesArray[0].longitude,
    },
    zoom: 18,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: true,
  };
}
