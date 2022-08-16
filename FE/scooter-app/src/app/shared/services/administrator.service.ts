import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, firstValueFrom } from 'rxjs';
import { CustomerElement } from '../models/customerElement';

@Injectable({
  providedIn: 'root',
})
export class AdministratorService {
  url: string = 'https://move-scooter-app.herokuapp.com/administrator';
  header = {
    headers: new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    ),
  };

  constructor(private http: HttpClient) {}

  async checkLogin(username: string, password: string) {
    let postData = { email: username, password: password };
    const response = await firstValueFrom(
      this.http.post(this.url + '/login', postData)
    );

    return response;
  }

  getUsers(start?: number, length?: number) {
    if (start === undefined || length === undefined) {
      start = 0;
      length = 0;
    }
    const res = firstValueFrom(
      this.http.get<CustomerElement[]>(
        this.url + '/customers?start=' + start + '&length=' + length,
        this.header
      )
    );

    console.log(res);
    return res;
  }

  getNoOfUsers() {
    const res = firstValueFrom(
      this.http.get<number>(this.url + '/customers/count', this.header)
    );
    return res;
  }
}
