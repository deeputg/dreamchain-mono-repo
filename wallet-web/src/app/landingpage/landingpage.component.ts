import { Component, OnInit, Output,EventEmitter, ViewChild } from '@angular/core'
import { MatDialog, MatDialogConfig, MatIconRegistry } from '@angular/material'
import { DomSanitizer } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { SessionStorage } from 'ngx-webstorage'
import { AddEditNetworkDialogComponent, ChangeLastNetworkDialogComponent, SelectAccountDialogComponent } from '../dialogs'
import { LoginState } from '../models/login-state.model'
import { Network, NetworkChaindId, NetworkProtocol } from '../models/network.model'
//services
import { AccountService, ConfigService, CryptoService, FactoryPluginService, LoginService } from '../services/'
import { ObservablesService } from '../services/observables.service';
import { ModalService } from '../services/modal.service';
import { LoginComponent } from '../login/login.component';
import { CreateAccountComponent } from '../create-account/create-account.component';


@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.scss']
})
export class LandingpageComponent implements OnInit {
  @SessionStorage()
  public isLoggedIn: LoginState

  public userLog:boolean;
  constructor(
    private observables: ObservablesService,
    private modalService: ModalService,
    public dialog: MatDialog,
    public loginService: LoginService,
  ) { }

  public ngOnInit() {
    this.observables.dynamicUserLogged.subscribe(userLogged => {
      this.userLog = userLogged;
    });
    if(this.isLoggedIn=="public key"){
      this.userLog = true;
    }
  }
}
