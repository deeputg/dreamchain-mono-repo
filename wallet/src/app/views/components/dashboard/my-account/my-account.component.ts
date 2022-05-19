import { Component, OnInit } from '@angular/core';
import { DrmService } from '../../../../services/drm.service';
import { ApiService } from '../../../../services/api.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ValidationService } from '../../../../services/validation.service';
import { SessionStorage, SessionStorageService } from 'ngx-webstorage'
import { interval, Subscription } from "rxjs";
import Swal from 'sweetalert2';
import * as copy from 'copy-to-clipboard';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {

  @SessionStorage()
  public isLoggedIn
  @SessionStorage()
  public accountName

  sendDRMC: boolean;
  sendDRMI: boolean;
  tokenTransfer: boolean;
  accountInfo: any;
  transferForm: FormGroup;
  buyDrmcForm: FormGroup;
  buyDrmiForm: FormGroup;
  drmcQty: string;
  drmiQty: string;
  usd: string;
  DrmiBuy: boolean;
  DrmcBuy: boolean;
  transferToken: boolean;

  constructor(
    public drmService: DrmService,
    public apiService: ApiService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.transferToken = true;
    this.DrmiBuy = true;
    this.DrmcBuy = true;
    this.sendDRMC = false;
    this.sendDRMI = false;
    this.tokenTransfer = true;
    this.transferForm = this.formBuilder.group({
      recipient: new FormControl('', [Validators.required, ValidationService.accountNameValidator]),
      amount: new FormControl('', [Validators.required, ValidationService.numberOnlyValidator]),
      symbol: new FormControl(null, [Validators.required]),
      memo: new FormControl('')
    });
    this.getAccount();
    this.buyDrmcForm = this.formBuilder.group({
      drmcQuantity: ['', [Validators.required, ValidationService.numberOnlyValidator]],
      usdQty: ['']
    })
    this.buyDrmiForm = this.formBuilder.group({
      drmiQty: ['', [Validators.required, ValidationService.numberOnlyValidator]],
      drmcQty: ['']
    })
  }
  onByDrmc() {
    this.sendDRMI = false;
    this.sendDRMC = true;
    this.tokenTransfer = false;
    this.transferForm.reset({
      recipient: '',
      amount: '',
      symbol: null,
      memo: ''
    });
    this.buyDrmcForm.reset({
      drmcQuantity: ''
    });
    this.buyDrmiForm.reset({
      drmiQty: '',
      drmcQty: ''
    });
  }
  onByDrmi() {
    this.sendDRMC = false;
    this.sendDRMI = true;
    this.tokenTransfer = false;
    this.transferForm.reset({
      recipient: '',
      amount: '',
      symbol: null,
      memo: ''
    });
    this.buyDrmcForm.reset({
      drmcQuantity: ''
    });
    this.buyDrmiForm.reset({
      drmiQty: '',
      drmcQty: ''
    });
  }
  ontokenTransfer() {
    this.sendDRMC = false;
    this.tokenTransfer = true;
    this.sendDRMI = false;
    this.transferForm.reset({
      recipient: '',
      amount: '',
      symbol: null,
      memo: ''
    });
    this.buyDrmcForm.reset({
      drmcQuantity: ''
    });
    this.buyDrmiForm.reset({
      drmiQty: '',
      drmcQty: ''
    });
  }

  public subscribe = interval(5000).subscribe(val => {
    if (this.isLoggedIn !== false) {
      this.getAccount();
    }
  });
  async getAccount() {
    if (this.isLoggedIn) {
      this.accountInfo = await this.drmService.getAccountInfo();
    }

  }
  async transferTokens() {
    if (this.isLoggedIn) {
      if (this.transferForm.valid && this.transferToken) {
        const { recipient, amount, symbol, memo } = this.transferForm.value;
        this.transferToken = false
        this.drmService.transferTokens({ recipient, quantity: parseFloat(amount), symbol, memo }).then(result => {
          if (result) {
            Swal.fire({
              title: 'Success',
              text: 'Transaction has completed successfully',
              icon: 'success',
              showCancelButton: false,
              confirmButtonText: 'Done',
              allowOutsideClick: false
            }).then((result) => {
              if (result.value) {
                this.transferToken = true
                this.transferForm.reset({
                  recipient: '',
                  amount: '',
                  symbol: null,
                  memo: ''
                });
              }
            })
          }
        })
          .catch(err => {
            if (JSON.parse(err).error.details[0].message == "assertion failure with message: to account does not exist") {
              Swal.fire({
                title: 'Failed',
                text: 'Transaction was unsuccessful \n Reason: Receiver account does not exists.',
                icon: 'error',
                showCancelButton: false,
                confirmButtonText: 'Done',
                allowOutsideClick: false
              }).then((result) => {
                if (result.value) {
                  this.transferToken = true;
                  this.transferForm.reset({
                    recipient: '',
                    amount: '',
                    symbol: null,
                    memo: ''
                  });
                }
              })
            }
            else if (JSON.parse(err).error.details[0].message == "assertion failure with message: overdrawn balance") {
              Swal.fire({
                title: 'Failed',
                text: 'Transaction was unsuccessful \n Reason: Insufficient balance.',
                icon: 'error',
                showCancelButton: false,
                confirmButtonText: 'Done',
                allowOutsideClick: false
              }).then((result) => {
                if (result.value) {
                  this.transferToken = true;
                  this.transferForm.reset({
                    recipient: '',
                    amount: '',
                    symbol: null,
                    memo: ''
                  });
                }
              })
            }
            else if (JSON.parse(err).error.details[0].message == "assertion failure with message: no balance object found") {
              Swal.fire({
                title: 'Failed',
                text: 'Transaction was unsuccessful \n Reason: Insufficient balance.',
                icon: 'error',
                showCancelButton: false,
                confirmButtonText: 'Done',
                allowOutsideClick: false
              }).then((result) => {
                if (result.value) {
                  this.transferToken = true;
                  this.transferForm.reset({
                    recipient: '',
                    amount: '',
                    symbol: null,
                    memo: ''
                  });
                }
              })
            }
            else if (JSON.parse(err).error.details[0].message == "assertion failure with message: must transfer positive quantity") {
              Swal.fire({
                title: 'Failed',
                text: 'Transaction was unsuccessful \n Reason: Must transfer a positive quantity.',
                icon: 'error',
                showCancelButton: false,
                confirmButtonText: 'Done'
              }).then((result) => {
                if (result.value) {
                  this.transferToken = true;
                  this.transferForm.reset({
                    recipient: '',
                    amount: '',
                    symbol: null,
                    memo: ''
                  });
                }
              })
            }
            else if (JSON.parse(err).error.details[0].message == "assertion failure with message: cannot transfer to self") {
              Swal.fire({
                title: 'Failed',
                text: 'Transaction was unsuccessful \n Reason: Can not transfer to the same accounnt.',
                icon: 'error',
                showCancelButton: false,
                confirmButtonText: 'Done',
                allowOutsideClick: false
              }).then((result) => {
                if (result.value) {
                  this.transferToken = true;
                  this.transferForm.reset({
                    recipient: '',
                    amount: '',
                    symbol: null,
                    memo: ''
                  });
                }
              })
            }
          });
      }

    }

  }

  async onDrmcChange() {
    this.DrmcBuy = true;
    this.drmiQty = (this.buyDrmiForm.value).drmcQty;
    const balance = await this.drmService.getCurrencyBalance('{"code":"eosio.token","account":"' + this.accountName + '","symbol":"DRMC"}').toPromise();
    if (Number(balance[0].split(" ", 1)[0]) < Number(parseFloat(this.drmiQty).toFixed(4))) {
      Swal.fire({
        title: 'Failed',
        text: 'Insufficient balance',
        icon: 'error',
        showCancelButton: false,
        confirmButtonText: 'Done',
        allowOutsideClick: false
      }).then((result) => {
        if (result.value) {
          this.buyDrmiForm.reset({
            drmiQty: '',
            drmcQty: ''
          });
        }
      })
    }
  }

  async onDrmiChange() {
    this.drmcQty = (this.buyDrmiForm.value).drmiQty;
    this.DrmiBuy = true;
    const balance = await this.drmService.getCurrencyBalance('{"code":"eosio.token","account":"' + this.accountName + '","symbol":"DRMC"}').toPromise();
    if (Number(balance[0].split(" ", 1)[0]) < Number(parseFloat(this.drmcQty).toFixed(4))) {
      Swal.fire({
        title: 'Failed',
        text: 'Insufficient balance',
        icon: 'error',
        showCancelButton: false,
        confirmButtonText: 'Done',
        allowOutsideClick: false
      }).then((result) => {
        if (result.value) {
          this.buyDrmiForm.reset({
            drmiQty: '',
            drmcQty: ''
          });
        }
      })
    }
  }

  async buyDrmc() {
    if (this.isLoggedIn) {
      if (this.buyDrmcForm.valid && this.DrmcBuy) {
        this.DrmcBuy = false;
        const quantity = (this.buyDrmcForm.value).drmcQuantity;
        if (parseFloat(quantity).toFixed(4) <= parseFloat('0').toFixed(4)) {
          Swal.fire({
            title: 'Failed',
            text: 'Transaction was unsuccessful \n Reason: Must transfer a positive quantity. You can buy DRMC starting from 0.0001 and above.',
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'Done',
            allowOutsideClick: false
          }).then((result) => {
            if (result.value) {
              this.DrmcBuy = true
              this.buyDrmcForm.reset({
                drmcQuantity: '',
                usdQty: ''
              });
            }
          })
        }
        else {
          const amount = parseFloat(quantity).toFixed(4) + " DRMC";
          try {
            this.apiService.doFaucetDRMC(this.accountName, amount)
              .subscribe(data => {
                Swal.fire({
                  title: 'Success',
                  text: 'You have received ' + amount + '\n TxnId: ' + data["txId"],
                  icon: 'success',
                  showCancelButton: false,
                  confirmButtonText: 'Done',
                  allowOutsideClick: false
                }).then((result) => {
                  if (result.value) {
                    this.DrmcBuy = true
                    this.buyDrmcForm.reset({
                      drmcQuantity: '',
                      usdQty: ''
                    });
                  }
                })
              })
          } catch (error) {
            if (error.code === 402) {
              Swal.fire({
                title: 'Failed',
                text: 'Transaction was unsuccessful \n Reason: ' + error.message,
                icon: 'error',
                showCancelButton: false,
                confirmButtonText: 'Done'
              }).then((result) => {
                if (result.value) {
                  this.DrmcBuy = true
                  this.buyDrmcForm.reset({
                    drmcQuantity: '',
                    usdQty: ''
                  });
                }
              })
            } else {
              Swal.fire({
                title: 'Failed',
                text: 'Transaction was unsuccessful\n Reason: ' + error,
                icon: 'error',
                showCancelButton: false,
                confirmButtonText: 'Done',
                allowOutsideClick: false
              }).then((result) => {
                if (result.value) {
                  this.DrmcBuy = true
                  this.buyDrmcForm.reset({
                    drmcQuantity: '',
                    usdQty: ''
                  });
                }
              })
            }

          }
        }
      }
    }
  }

  async buyDrmi() {
    if (this.isLoggedIn) {
      if (this.buyDrmiForm.valid && this.DrmiBuy) {
        this.DrmiBuy = false;
        const quantity = (this.buyDrmiForm.value).drmiQty;
        if (parseFloat(quantity).toFixed(4) <= parseFloat('0').toFixed(4)) {
          Swal.fire({
            title: 'Failed',
            text: 'Transaction was unsuccessful \n Reason: Must transfer a positive quantity. You can buy DRMI starting from 0.0001 and above',
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'Done',
            allowOutsideClick: false
          }).then((result) => {
            if (result.value) {
              this.DrmiBuy = true;
              this.buyDrmiForm.reset({
                drmiQty: '',
                drmcQty: ''
              });
            }
          })
        }
        else {
          const amount = parseFloat(quantity).toFixed(4) + " DRMI";
          this.drmService.transferTokens({ recipient: 'signupdrmdrm', quantity: parseFloat(amount), symbol: 'DRMC', memo: 'buying DRMI for ' + this.accountName }).then(result => {
            if (result) {
              try {
                this.apiService.doFaucetDRMI(this.accountName, amount)
                  .subscribe(data => {
                    Swal.fire({
                      title: 'Success',
                      text: 'You have received ' + amount + '\n TxnId: ' + data["txId"],
                      icon: 'success',
                      showCancelButton: false,
                      confirmButtonText: 'Done',
                      allowOutsideClick: false
                    }).then((result) => {
                      if (result.value) {
                        this.DrmiBuy = true;
                        this.buyDrmiForm.reset({
                          drmiQty: '',
                          drmcQty: ''
                        });
                      }
                    })
                  })
              } catch (error) {
                if (error.code === 402) {
                  Swal.fire({
                    title: 'Failed',
                    text: 'Transaction was unsuccessful \n Reason: ' + error.message,
                    icon: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Done',
                    allowOutsideClick: false
                  }).then((result) => {
                    if (result.value) {
                      this.DrmiBuy = true;
                      this.buyDrmiForm.reset({
                        drmiQty: '',
                        drmcQty: ''
                      });
                    }
                  })
                } else {
                  Swal.fire({
                    title: 'Failed',
                    text: 'Transaction was unsuccessful\n Reason: ' + error,
                    icon: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Done',
                    allowOutsideClick: false
                  }).then((result) => {
                    if (result.value) {
                      this.DrmiBuy = true;
                      this.buyDrmiForm.reset({
                        drmiQty: '',
                        drmcQty: ''
                      });
                    }
                  })
                }

              }
            }
          })
            .catch(err => {
              Swal.fire({
                title: 'Failed',
                text: 'Transaction was unsuccessful \n Reason: ' + JSON.parse(err).error.details[0].message,
                icon: 'error',
                showCancelButton: false,
                confirmButtonText: 'Done',
                allowOutsideClick: false
              }).then((result) => {
                if (result.value) {
                  this.DrmiBuy = true;
                  this.buyDrmiForm.reset({
                    drmiQty: '',
                    drmcQty: ''
                  });
                }
              })
            });
        }
      }
    }
  }

  drmcQuantityChange() {
    this.buyDrmcForm.reset({
      drmcQuantity: (this.buyDrmcForm.value).drmcQuantity,
      usdQty: '0'
    })
  }
  doCopyName() {
    copy(this.accountName);
    Swal.fire({
      title: 'Copied',
      text: this.accountName,
      icon: 'success',
      timer: 1000,
      showConfirmButton: false
    })
  }

  tokenTransferBtn() {
    this.transferToken = false;
  }

}
