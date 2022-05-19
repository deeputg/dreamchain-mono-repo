import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DrmService } from '../../../services/drm.service';
import { SessionStorage, SessionStorageService } from 'ngx-webstorage'
import {TransactionBar} from './txHistory.model';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { interval } from 'rxjs';

@Component({
  selector: 'app-tx-history',
  templateUrl: './tx-history.component.html',
  styleUrls: ['./tx-history.component.css']
})
export class TxHistoryComponent implements OnInit {

  @SessionStorage()
  public isLoggedIn: boolean
  @SessionStorage()
  public accountName: string

  public result;
  public resNumber;
  public model: TransactionBar
  public txs: any;
  constructor(
    public router: Router,
    public drmService: DrmService
  ) { }

  ngOnInit(): void {
    this.getActions();
  }

  getActions () {
    this.result = { actions: [] }
    this.resNumber = 0
    this.drmService.getActions('{"account_name":"' + this.accountName + '", "offset":-500}').subscribe(data => { // we are exploring only last 500 actions
      if (data) {
        this.model = data
        this.model.actions.reverse()

        this.model.actions = _.transform(_.uniqBy(this.model.actions, 'action_trace.trx_id'), function(result, value) {
          result.push(value);
        }, []);

        for (let action in this.model.actions) {
          if ((this.model.actions[action]).action_trace.act.name === 'transfer' && this.resNumber < 5) {
            if ((this.model.actions[action]).action_trace.act.data.from === this.accountName) {
              this.model.actions[action].direction = 'Out'
            } else {
              this.model.actions[action].direction = 'In'
            }
            this.result.actions.push(this.model.actions[action])
            this.resNumber++
          }
        }
      }
    })
  }
  // public subscribe = interval(5000).subscribe(val => {
  //   if (this.isLoggedIn !== false) {
  //     this.getActions();
  //   }
  // });
}
