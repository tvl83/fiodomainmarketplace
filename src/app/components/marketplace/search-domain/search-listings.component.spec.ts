import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchListingsComponent } from './search-listings.component';

describe('SearchDomainComponent', () => {
  let component: SearchListingsComponent;
  let fixture: ComponentFixture<SearchListingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchListingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
