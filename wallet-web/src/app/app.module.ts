import { CommonModule } from '@angular/common'
import { HttpClient, HttpClientModule } from '@angular/common/http'
import { APP_INITIALIZER, NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { MAT_DIALOG_DATA,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatDialogRef,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule, MatListModule,
  MatOptionModule,
  MatProgressBarModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
} from '@angular/material'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatTooltipModule } from '@angular/material/tooltip'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule, Routes } from '@angular/router'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { PapaParseModule } from 'ngx-papaparse'
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar'
import { Ng2Webstorage } from 'ngx-webstorage'

import { GAnalyticsDirective } from './directive/g-analytics.directive'
import { DateCheckPipe } from './pipes'
import { AccountService, AuthGuardService, ConfigService, CryptoService, EosPluginService, EosService, FactoryPluginService, GAnalyticsService, InfoBarService, InformationService, ScatterService } from './services'

import { AddEditNetworkDialogComponent,
  ChangeLastNetworkDialogComponent,
  FailureDialogComponent,
  InfoDialogComponent,
  SelectAccountDialogComponent,
  SendingDialogComponent,
  SuccessDialogComponent
} from './dialogs'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { from } from 'rxjs';
import { ModalService } from './services/modal.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

/* View Components*/
import { ContractsNavbarComponent } from './contracts/contracts-navbar/contracts-navbar.component';
import { ContractsComponent } from './contracts/contracts.component';
import { DeployAbiComponent } from './contracts/deploy-abi/deploy-abi.component';
import { DeployContractComponent } from './contracts/deploy-contract/deploy-contract.component';
import { InteractWithContractComponent } from './contracts/interact-with-contract/interact-with-contract.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { FaqComponent } from './faq/faq.component';
import { FaucetComponent } from './faucet/faucet.component';
import { FindAccountComponent } from './find-account/find-account.component';
import { GenerateKeyPairsComponent } from './generate-key-pairs/generate-key-pairs.component';
import { InfoBarComponent } from './info-bar/info-bar.component';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { LoginComponent } from './login/login.component';
import { AdvancedPermissionsComponent } from './manage-account/advanced-permissions/advanced-permissions.component';
import { BuyRamComponent } from './manage-account/buy-sell-ram/buy-ram/buy-ram.component';
import { BuySellRamComponent } from './manage-account/buy-sell-ram/buy-sell-ram.component';
import { SellRamComponent } from './manage-account/buy-sell-ram/sell-ram/sell-ram.component';
import { DelegateComponent } from './manage-account/delegate/delegate.component';
import { DeletePermissionComponent } from './manage-account/delete-permission/delete-permission.component';
import { GetPermissionComponent } from './manage-account/get-permission/get-permission.component';
import { LinkPermissionComponent } from './manage-account/link-permission/link-permission.component';
import { LinkUnlinkComponent } from './manage-account/link-unlink/link-unlink.component';
import { MainManageAccountComponent } from './manage-account/main-manage-account/main-manage-account.component';
import { ManageAccountNavbarComponent } from './manage-account/manage-account-navbar/manage-account-navbar.component';
import { RefundStakeComponent } from './manage-account/refund-stake/refund-stake.component';
import { SetRamFormComponent } from './manage-account/set-ram/set-ram-form/set-ram-form.component';
import { SetRamRateComponent } from './manage-account/set-ram/set-ram-rate/set-ram-rate.component';
import { SetRamComponent } from './manage-account/set-ram/set-ram.component';
import { UndelegateComponent } from './manage-account/undelegate/undelegate.component';
import { UnlinkPermissionComponent } from './manage-account/unlink-permission/unlink-permission.component';
import { CreateProxyComponent } from './manage-voting/create-proxy/create-proxy.component';
import { ManageVotingNavbarComponent } from './manage-voting/manage-voting-navbar/manage-voting-navbar.component';
import { ManageVotingComponent } from './manage-voting/manage-voting.component';
import { RegisterProducerComponent } from './manage-voting/register-producer/register-producer.component';
import { RegisterProxyInfoComponent } from './manage-voting/register-proxy-info/register-proxy-info.component';
import { RemoveProducerComponent } from './manage-voting/remove-producer/remove-producer.component';
import { ResignProxyComponent } from './manage-voting/resign-proxy/resign-proxy.component';
import { UnregisterProxyInfoComponent } from './manage-voting/resign-proxy/unregister-proxy-info/unregister-proxy-info.component';
import { SetProducerComponent } from './manage-voting/set-producer/set-producer.component';
import { SetProxyComponent } from './manage-voting/set-proxy/set-proxy.component';
import { UnregisterProducerComponent } from './manage-voting/unregister-producer/unregister-producer.component';
import { VoterProducerComponent } from './manage-voting/voter-producer/voter-producer.component';
import { NameBindsBarComponent } from './name-binds-bar/name-binds-bar.component';
import { NavBarSliderComponent } from './nav-bar-slider/nav-bar-slider.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CancelDelayComponent } from './other/cancel-delay/cancel-delay.component';
import { ClaimRewardsComponent } from './other/claim-rewards/claim-rewards.component';
import { OnErrorComponent } from './other/on-error/on-error.component';
import { OtherNavbarComponent } from './other/other-navbar/other-navbar.component';
import { OtherComponent } from './other/other.component';
import { PremiumNameComponent } from './other/premium-name/premium-name.component';
import { SetAccountLimitsComponent } from './other/set-account-limits/set-account-limits.component';
import { SetGlobalLimitsComponent } from './other/set-global-limits/set-global-limits.component';
import { SetParamsComponent } from './other/set-params/set-params.component';
import { SetPrivilegeComponent } from './other/set-privilege/set-privilege.component';
import { OurFeaturesComponent } from './our-features/our-features.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PopupNoteComponent } from './popup-note/popup-note.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { TransactionBarComponent } from './transaction-bar/transaction-bar.component';
import { TransferTokensComponent } from './transfer-tokens/transfer-tokens.component';
import { UnchangedFieldLoginComponent } from './unchanged-field-login/unchanged-field-login.component'
import { UnchangedFieldComponent } from './unchanged-field/unchanged-field.component';
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { PageComponent } from './layouts/page/page.component';
import { ErrorComponent } from './error/error.component';
import { TxhistoryComponent } from './txhistory/txhistory.component';
import { AccountInfoComponent } from './account-info/account-info.component';
import { AboutComponent } from './about/about.component';

declare var $: any

export const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
}

library.add(faQuestionCircle)

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatButtonToggleModule,
    MatCardModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatDialogModule,
    MatOptionModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatAutocompleteModule,
    FontAwesomeModule,
    PerfectScrollbarModule,
    PapaParseModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  exports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatButtonToggleModule,
    MatCardModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatRadioModule,
    MatListModule,
    MatTooltipModule,
    MatAutocompleteModule,
    FontAwesomeModule,
    PerfectScrollbarModule,
    PapaParseModule
  ],
  entryComponents: [
    SuccessDialogComponent,
    FailureDialogComponent,
    SendingDialogComponent,
    SelectAccountDialogComponent,
    InfoDialogComponent,
    AddEditNetworkDialogComponent,
    ChangeLastNetworkDialogComponent
  ],
  declarations: [LandingpageComponent, FaucetComponent, HeaderComponent, FooterComponent , PageComponent, ErrorComponent, TxhistoryComponent, AccountInfoComponent, AboutComponent]
})
export class MaterialModule {}

export function initializeApp (appConfig: ConfigService) {
  return () => appConfig.load()
}

export function initializeEos (eosService: EosService) {
  return () => eosService.load()
}

@NgModule({
  declarations: [
    AppComponent,
    PopupNoteComponent,
    NavbarComponent,
    PageNotFoundComponent,
    MainManageAccountComponent,
    CreateAccountComponent,
    LoginComponent,
    TransferTokensComponent,
    GenerateKeyPairsComponent,
    FaqComponent,
    OurFeaturesComponent,
    DelegateComponent,
    PremiumNameComponent,
    UndelegateComponent,
    GenerateKeyPairsComponent,
    FindAccountComponent,
    ManageVotingComponent,
    CreateProxyComponent,
    RegisterProxyInfoComponent,
    ResignProxyComponent,
    UnregisterProxyInfoComponent,
    ClaimRewardsComponent,
    SetProxyComponent,
    ContractsComponent,
    DeployContractComponent,
    InteractWithContractComponent,
    InfoBarComponent,
    TransactionBarComponent,
    NameBindsBarComponent,
    UnchangedFieldComponent,
    UnchangedFieldLoginComponent,
    SideBarComponent,
    ManageAccountNavbarComponent,
    RegisterProducerComponent,
    BuySellRamComponent,
    RemoveProducerComponent,
    ManageVotingNavbarComponent,
    SetProducerComponent,
    UnregisterProducerComponent,
    VoterProducerComponent,
    UnlinkPermissionComponent,
    DeletePermissionComponent,
    AdvancedPermissionsComponent,
    SetRamFormComponent,
    SetRamRateComponent,
    SetRamComponent,
    OtherComponent,
    OtherNavbarComponent,
    RefundStakeComponent,
    CancelDelayComponent,
    OnErrorComponent,
    FailureDialogComponent,
    SelectAccountDialogComponent,
    SuccessDialogComponent,
    SendingDialogComponent,
    InfoDialogComponent,
    AddEditNetworkDialogComponent,
    ChangeLastNetworkDialogComponent,
    SetAccountLimitsComponent,
    SetGlobalLimitsComponent,
    SetPrivilegeComponent,
    SetParamsComponent,
    ContractsNavbarComponent,
    DeployAbiComponent,
    LinkPermissionComponent,
    LinkUnlinkComponent,
    NavBarSliderComponent,
    GetPermissionComponent,
    BuyRamComponent,
    SellRamComponent,
    DateCheckPipe,
    GAnalyticsDirective
  ],
  imports: [
    AppRoutingModule,
    MaterialModule,
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    HttpClientModule,
    MatIconModule,
    MatSelectModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    FormsModule,
    ReactiveFormsModule,
    Ng2Webstorage,
    NgbModule.forRoot()
  ],
  entryComponents: [ LoginComponent, CreateAccountComponent ],
  providers: [
    ModalService,
    AccountService,
    AuthGuardService,
    InformationService,
    InfoBarService,
    FactoryPluginService,
    ScatterService,
    EosPluginService,
    CryptoService,
    EosService,
    ConfigService,
    GAnalyticsService,
    { provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService], multi: true },
    { provide: APP_INITIALIZER,
      useFactory: initializeEos,
      deps: [EosService], multi: true },
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// required for AOT compilation
export function HttpLoaderFactory (http: HttpClient) {
  return new TranslateHttpLoader(http)
}
