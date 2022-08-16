import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DialogData } from 'src/app/shared/models/dialogData';
import { ScooterService } from 'src/app/shared/services/scooter.services';
import Swal from 'sweetalert2';

export class DialogOverviewExample {
  number: number;
  internalId: number;
  battery: number;
  coordX: number;
  coordY: number;
  unlockCode: number;

  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      data: {
        number: this.number,
        internalId: this.internalId,
        battery: this.battery,
        coordX: this.coordX,
        coordY: this.coordY,
        unlockCode: this.unlockCode,
      },
    });
  }
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './scooter-add.component.html',
  styleUrls: ['./scooter-add.component.scss'],
})
export class DialogOverviewExampleDialog {
  check: Boolean;
  text: string;
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private scooterService: ScooterService
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  async showData() {
    let response;
    try {
      response = await this.scooterService.register(
        this.data.number,
        this.data.battery,
        this.data.internalId,
        this.data.coordX,
        this.data.coordY,
        this.data.unlockCode
      );

      Swal.fire('Registered!', this.text, 'success');
    } catch (err) {
      const msg = JSON.parse(JSON.stringify(err)).error.message;
      console.log(msg);
      Swal.fire('Error!', msg, 'error');
    }
  }

  number = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
  ]);

  battery = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
    Validators.minLength(1),
    Validators.maxLength(2),
  ]);
}
