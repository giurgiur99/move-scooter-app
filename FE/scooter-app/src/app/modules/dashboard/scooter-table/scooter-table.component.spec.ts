import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScooterTableComponent } from './scooter-table.component';

describe('ScooterTableComponent', () => {
  let component: ScooterTableComponent;
  let fixture: ComponentFixture<ScooterTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScooterTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScooterTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
