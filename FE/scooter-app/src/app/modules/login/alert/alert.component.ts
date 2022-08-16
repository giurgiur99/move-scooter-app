import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent implements OnInit, OnChanges {
  @Input() check: boolean;
  text: string = '';
  constructor() {}

  ngOnInit(): void {}
  ngOnChanges(): void {
    if (this.check) {
      this.text = 'Login successful';
    } else {
      this.text = 'Bad credentials';
    }
  }
}
