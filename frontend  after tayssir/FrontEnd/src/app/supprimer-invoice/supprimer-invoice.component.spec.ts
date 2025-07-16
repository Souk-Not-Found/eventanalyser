import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupprimerInvoiceComponent } from './supprimer-invoice.component';

describe('SupprimerInvoiceComponent', () => {
  let component: SupprimerInvoiceComponent;
  let fixture: ComponentFixture<SupprimerInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupprimerInvoiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupprimerInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
