import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDomainsComponent } from './my-domains.component';

describe('MyDomainsComponent', () => {
  let component: MyDomainsComponent;
  let fixture: ComponentFixture<MyDomainsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyDomainsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyDomainsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
