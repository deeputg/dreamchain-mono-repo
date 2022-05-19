import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TxhistoryComponent } from './txhistory.component';

describe('TxhistoryComponent', () => {
  let component: TxhistoryComponent;
  let fixture: ComponentFixture<TxhistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TxhistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TxhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
