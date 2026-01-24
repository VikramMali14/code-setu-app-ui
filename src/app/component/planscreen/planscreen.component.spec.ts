import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanscreenComponent } from './planscreen.component';

describe('PlanscreenComponent', () => {
  let component: PlanscreenComponent;
  let fixture: ComponentFixture<PlanscreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanscreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanscreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
