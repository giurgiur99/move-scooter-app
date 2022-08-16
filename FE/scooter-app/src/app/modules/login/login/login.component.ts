import { Component, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Administrator } from 'src/app/shared/models/administrator';
import { AdministratorService } from 'src/app/shared/services/administrator.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  administrator: Administrator = {
    email: 'admin2@gmail.com',
    password: 'parola',
  };
  @Output() check: boolean = null;
  show: boolean = false;

  constructor(
    private administratorService: AdministratorService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  async handleLogin() {
    let response;
    try {
      response = await this.administratorService.checkLogin(
        this.administrator.email,
        this.administrator.password
      );
      this.show = true;
    } catch (err) {
      this.check = false;
      return console.log(err);
    }

    if (response) {
      this.check = true;
      const token = JSON.parse(JSON.stringify(response)).token;
      localStorage.setItem('token', token);
      console.log(token);
      this.router.navigate(['/dashboard']);
    } else {
      this.check = false;
    }
  }
}
