import {
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { debounceTime, interval, Subject, Subscription } from 'rxjs';
import { Coordinates, MarkerOptions } from 'src/app/shared/models/mapOptions';
import { Scooter } from 'src/app/shared/models/scooter';
import { ScooterService } from 'src/app/shared/services/scooter.services';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GoogleMap } from '@angular/google-maps';
@Component({
  selector: '.app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MapsComponent implements OnInit, OnDestroy {
  @ViewChild(GoogleMap, { static: false }) GoogleMap: GoogleMap;
  dataSource: Scooter[];
  coordinates: Coordinates[];
  markers: MarkerOptions[] = [];
  @Output()
  data: Scooter;
  mapDragSubject = new Subject<void>();
  subscriptions: Subscription[] = [];
  image = {
    url: 'http://localhost:4200/assets/marker.png',
    scaledSize: new google.maps.Size(35, 45),
  };
  styles: google.maps.MapTypeStyle[] = [
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }],
    },
  ];
  options: google.maps.MapOptions = {
    styles: this.styles,
    center: { lat: 46.770891, lng: 23.589743 },
    zoom: 14,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: true,
  };
  // LatLngBounds: google.maps.LatLngBounds;
  constructor(
    private scooterService: ScooterService,
    public dialog: MatDialog
  ) {}
  async ngOnInit() {
    this.subscriptions.push(
      this.mapDragSubject.pipe(debounceTime(300)).subscribe(() => {
        this.mapDrag();
      })
    );
    this.subscriptions.push(interval(20000).subscribe(() => this.mapDrag()));
    this.refreshTab(
      23.566213023578662,
      46.753272331580874,
      23.628595540584076,
      46.78337872614691
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
  async refreshTab(
    bottomLeftCoordX: number,
    bottomLeftCoordY: number,
    topRightCoordX: number,
    topRightCoordY: number
  ) {
    try {
      this.dataSource = await this.scooterService.fetchScooters(
        bottomLeftCoordX,
        bottomLeftCoordY,
        topRightCoordX,
        topRightCoordY
      );
      this.dataSource.forEach((scooter) => {
        const scooterData = JSON.parse(JSON.stringify(scooter));
        const coord: number[] = scooterData.location.coordinates;
        const internalId: number = scooterData.internalId;
        // this.markers.pop();
        const marker = {
          position: {
            lng: coord[0],
            lat: coord[1],
          },
          icon: this.image,
          internalId: internalId,
        };
        if (
          !this.markers.find(
            (selectedMarker) => selectedMarker.internalId === marker.internalId
          )
        ) {
          this.markers.push(marker);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
  mapDrag() {
    let bottomLeftCoordX, bottomLeftCoordY, topRightCoordX, topRightCoordY;
    console.log('mapDrag');
    const topRightCoord = JSON.stringify(
      this.GoogleMap.getBounds().getNorthEast()
    );
    const bottomLeftCoord = JSON.stringify(
      this.GoogleMap.getBounds().getSouthWest()
    );
    topRightCoordX = JSON.parse(topRightCoord).lng;
    topRightCoordY = JSON.parse(topRightCoord).lat;
    bottomLeftCoordX = JSON.parse(bottomLeftCoord).lng;
    bottomLeftCoordY = JSON.parse(bottomLeftCoord).lat;
    this.refreshTab(
      Number(bottomLeftCoordX),
      Number(bottomLeftCoordY),
      Number(topRightCoordX),
      Number(topRightCoordY)
    );
  }
  onScooterClick(marker: MarkerOptions) {
    this.scooterService;
    this.openDialog(marker);
    marker.animation = google.maps.Animation.BOUNCE;
  }
  async openDialog(marker: MarkerOptions) {
    const scooter = await this.scooterService.getScotoerByInternalId(
      marker.internalId
    );
    const dialogRef = this.dialog.open(ScooterInfo, {
      data: scooter,
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
@Component({
  selector: 'scooter-info',
  templateUrl: 'scooter-info.html',
  styleUrls: ['./scooter.component.scss'],
})
export class ScooterInfo {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Scooter) {
    console.log(data);
  }
}
