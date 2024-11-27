import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TherapyCentreComponent } from './therapy-centre.component';

describe('TherapyCentreComponent', () => {
  let component: TherapyCentreComponent;
  let fixture: ComponentFixture<TherapyCentreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TherapyCentreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TherapyCentreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
