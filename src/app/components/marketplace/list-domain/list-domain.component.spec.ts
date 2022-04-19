import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDomainComponent } from './list-domain.component';

describe('ListDomainComponent', () => {
  let component: ListDomainComponent;
  let fixture: ComponentFixture<ListDomainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListDomainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListDomainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
