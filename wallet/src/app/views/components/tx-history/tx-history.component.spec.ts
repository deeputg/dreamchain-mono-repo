import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TxHistoryComponent } from './tx-history.component';

describe('TxHistoryComponent', () => {
  let component: TxHistoryComponent;
  let fixture: ComponentFixture<TxHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TxHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TxHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
