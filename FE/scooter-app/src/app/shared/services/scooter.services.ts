import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Scooter } from '../models/scooter';
import { Trip } from '../models/trip';

@Injectable({
  providedIn: 'root',
})
export class ScooterService {
  url: string = 'https://move-scooter-app.herokuapp.com/';
  header = {
    headers: new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    ),
  };

  constructor(private http: HttpClient) {}

  async findAll() {
    return await firstValueFrom(
      this.http.get<Scooter[]>(this.url + 'scooter/' + 'all')
    );
  }

  async fetchScooters(
    bottomLeftCoordX: number,
    bottomLeftCoordY: number,
    topRightCoordX: number,
    topRightCoordY: number
  ) {
    return await firstValueFrom(
      this.http.get<Scooter[]>(
        this.url +
          'scooter/' +
          'area?' +
          'bottomLeftCoordX=' +
          bottomLeftCoordX +
          '&bottomLeftCoordY=' +
          bottomLeftCoordY +
          '&topRightCoordX=' +
          topRightCoordX +
          '&topRightCoordY=' +
          topRightCoordY
      )
    );
  }

  async register(
    number: number,
    battery: number,
    internalId: number,
    coordX: number,
    coordY: number,
    unlockCode: number
  ) {
    let postData = { number, battery, internalId, coordX, coordY, unlockCode };
    return await firstValueFrom(
      this.http.post(
        this.url + 'administrator/scooter/' + 'register',
        postData,
        this.header
      )
    );
  }

  async suspend(internalId: string) {
    return await firstValueFrom(
      this.http.post(
        this.url +
          'administrator/scooter/' +
          'suspend' +
          '?scooterInternalId=' +
          internalId,
        null
      )
    );
  }

  async unsuspend(internalId: string) {
    return await firstValueFrom(
      this.http.post(
        this.url +
          'administrator/scooter/' +
          'unsuspend' +
          '?scooterInternalId=' +
          internalId,
        null
      )
    );
  }

  async trips(start: number, length: number) {
    return await firstValueFrom(
      this.http.get<Trip[]>(
        this.url +
          'administrator/scooter/' +
          'trips?start=' +
          start +
          '&length=' +
          length,
        this.header
      )
    );
  }

  async noOfTrips() {
    return await firstValueFrom(
      this.http.get<number>(
        this.url + 'administrator/scooter/' + 'trips/count',
        this.header
      )
    );
  }

  async getScotoerByInternalId(id: number) {
    return await firstValueFrom(
      this.http.get<Scooter>(this.url + 'scooter/' + 'device?id=' + id)
    );
  }
}
