import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturescreenComponent } from './featurescreen.component';

describe('FeaturescreenComponent', () => {
  let component: FeaturescreenComponent;
  let fixture: ComponentFixture<FeaturescreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeaturescreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturescreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
