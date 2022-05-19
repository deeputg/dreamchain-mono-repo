import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatIconRegistry } from "@angular/material";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from '@angular/router'
import { TranslateService } from "@ngx-translate/core";
import { SessionStorage } from "ngx-webstorage";
import { AddEditNetworkDialogComponent, ChangeLastNetworkDialogComponent, SelectAccountDialogComponent } from '../dialogs'
import { LoginState } from "../models/login-state.model"
import { Network, NetworkChaindId, NetworkProtocol } from '../models/network.model'
import { Transfer } from "../models/transfer.model";
import { AccountService, ConfigService, CryptoService, DialogsService, FactoryPluginService, LoginService } from '../services/'
import { ApiService } from '../services/api.service'

export interface DropdownList {
  value: string;
  viewValue: string;
  recipient: string;
}

@Component({
  selector: "app-faucet",
  templateUrl: "./faucet.component.html",
  styleUrls: ["./faucet.component.scss"]
})
export class FaucetComponent implements OnInit {
  @SessionStorage()
  public faucetkey: string;
  @SessionStorage()
  public notLogin: boolean;

  public recipient: any;
  public faucetForm: FormGroup;
  public eos: any;
  public network: any;
  constructor(
    public dialog: MatDialog,
    private factoryPluginService: FactoryPluginService,
    private router: Router,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private translate: TranslateService,
    public loginService: LoginService,
    private accountService: AccountService,
    private cryptoService: CryptoService,
    private formBuilder: FormBuilder,
    private dialogsService: DialogsService,
    private apiService:ApiService
  ) {}

  public ngOnInit() {
    this.faucetForm = this.formBuilder.group({
          accountName: ['', Validators.required]
        });


  }

  public async transferDRMCTokens() {
    this.recipient = this.faucetForm.controls.accountName.value.toLowerCase();

    try
    {
    this.apiService.doFaucetDRMC(this.recipient)
      .subscribe(
        (data: any) => {
          this.dialogsService.showSuccess("DRMC has been transfered Sucessfully.")
          this.router.navigateByUrl('/login');
        });
    }
       catch (err) {
        if (err.code === 402) {
          this.dialogsService.showInfo(err.message)
        } else {
          this.dialogsService.showFailure(err)
        }
      }
    }

    public async transferDRMITokens() {
      this.recipient = this.faucetForm.controls.accountName.value;

      try
      {
      this.apiService.doFaucetDRMI(this.recipient)
        .subscribe(
          (data: any) => {
            this.dialogsService.showSuccess("DRMI has been transfered Sucessfully.")
            this.router.navigateByUrl('/login');
          });
      }
         catch (err) {
          if (err.code === 500) {
            this.dialogsService.showInfo(err.message)
          } else {
            this.dialogsService.showFailure(err)
          }
        }
      }

}
