import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  url: string = 'https://move-scooter-app.herokuapp.com/customer/';

  constructor(private http: HttpClient) {}

  async checkLogin(username: string, password: string) {
    let postData = { email: username, password: password };
    const response = await firstValueFrom(
      this.http.post(this.url + 'login', postData)
    );

    return response;
  }

  async downloadPhoto(path: string) {
    return await firstValueFrom(
      this.http.get(this.url + 'license?path=' + path)
    );
  }

  async suspendUser(username: string) {
    let postData = { username: username };
    return await firstValueFrom(this.http.post(this.url + 'suspend', postData));
  }

  async unsuspendUser(username: string) {
    let postData = { username: username };
    return await firstValueFrom(
      this.http.post(this.url + 'unsuspend', postData)
    );
  }
}
