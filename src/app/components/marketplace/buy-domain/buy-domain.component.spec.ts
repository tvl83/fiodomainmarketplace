import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyDomainComponent } from './buy-domain.component';

describe('BuyDomainComponent', () => {
  let component: BuyDomainComponent;
  let fixture: ComponentFixture<BuyDomainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuyDomainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyDomainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
