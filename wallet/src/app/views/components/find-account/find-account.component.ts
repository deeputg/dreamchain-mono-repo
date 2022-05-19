import { Component, OnInit } from '@angular/core';
import { SessionStorage, SessionStorageService } from 'ngx-webstorage'
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DrmService } from '../../../services/drm.service';
import { ValidationService } from '../../../services/validation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-find-account',
  templateUrl: './find-account.component.html',
  styleUrls: ['./find-account.component.css']
})
export class FindAccountComponent implements OnInit {

  @SessionStorage()
  public isLoggedIn: boolean
  @SessionStorage()
  public accountName: string

  findForm: FormGroup;
  totalBalance: string;
  stacked: any;
  unstaked: any;
  privileged: boolean;
  tokens: any
  created: string;
  showData: boolean;
  cpuStaked: string;
  netStaked: string;
  cpuAvailable: string;
  cpuMax: string;
  cpuUsed: string;
  netAvailable: any;
  netMax: any;
  netUsed: any;
  owner: string;
  ramAvailable: string;
  ramMax: string;
  cpuWeight: string;
  netWeight: string;
  cpuDelegated: string;
  netDelegated: string;

  constructor(
    public router: Router,
    public drmService: DrmService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.findForm = this.formBuilder.group({
      accountName: [this.accountName, [Validators.required, ValidationService.accountNameValidator]]
    });
    this.tokens = [];
    this.searchAccount()
    if (!this.isLoggedIn) {
      this.router.navigateByUrl('/');
      
    }
  }
  async searchAccount() {
    if (this.findForm.valid) {
      const accountName = (this.findForm.value).accountName;
      const requestBody = '{"account_name":"' + accountName + '"}'
      this.drmService.findByName(requestBody).subscribe(
        async data => {
          if (data) {
            this.showData = true;
            this.stacked = data.voter_info.staked / 10000;
            this.unstaked = Number(data.core_liquid_balance.split(" ", 1)[0]);
            this.totalBalance = this.stacked + this.unstaked;
            this.tokens = await this.drmService.getAllTokenInfo(accountName);
            this.privileged = data.privileged;
            this.created = data.created;
            this.cpuStaked = data.total_resources.cpu_weight;
            this.netStaked = data.total_resources.net_weight;
            this.owner = data.account_name;
            this.cpuAvailable = data.cpu_limit.available;
            this.cpuMax = data.cpu_limit.max;
            this.netAvailable = ((data.net_limit.available / 1024).toFixed(3)).toString();
            this.netMax = ((data.net_limit.max / 1024).toFixed(3)).toString();
            this.ramAvailable = (((Number(data.ram_quota) - Number(data.ram_usage)) / 1024).toFixed(3)).toString();
            this.ramMax = ((data.ram_quota / 1024).toFixed(3)).toString();
            this.cpuWeight = data.total_resources.cpu_weight;
            this.netWeight = data.total_resources.net_weight;
            this.cpuDelegated = data.self_delegated_bandwidth.cpu_weight;
            this.netDelegated = data.self_delegated_bandwidth.net_weight;
          }
          else {
            this.showData = false;
            Swal.fire({
              title: 'Failed',
              text: 'Unable to find account',
              icon: 'error',
              showCancelButton: false,
              confirmButtonText: 'Done'
            }).then((result) => {
              if (result.value) {
              }
            })
          }

        },
        error => {
          this.showData = false;
          if (error.error.error.code === '0') {
            Swal.fire({
              title: 'Failed',
              text: 'Unknown name',
              icon: 'error',
              showCancelButton: false,
              confirmButtonText: 'Done'
            }).then((result) => {
              if (result.value) {
              }
            })
          } else {
            Swal.fire({
              title: 'Failed',
              text: error.message,
              icon: 'error',
              showCancelButton: false,
              confirmButtonText: 'Done'
            }).then((result) => {
              if (result.value) {
              }
            })
          }
        });
    }

  }

}
