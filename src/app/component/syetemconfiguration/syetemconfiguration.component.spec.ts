import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyetemconfigurationComponent } from './syetemconfiguration.component';

describe('SyetemconfigurationComponent', () => {
  let component: SyetemconfigurationComponent;
  let fixture: ComponentFixture<SyetemconfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SyetemconfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SyetemconfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
