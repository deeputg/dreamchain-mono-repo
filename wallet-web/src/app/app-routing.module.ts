import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Components*/
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { PageComponent } from './layouts/page/page.component';
import { AuthGuard } from './guards';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { LoginComponent } from './login/login.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { FaqComponent } from './faq/faq.component';
import { FaucetComponent } from './faucet/faucet.component';
import { FindAccountComponent } from './find-account/find-account.component';
import { NameBindsBarComponent } from './name-binds-bar/name-binds-bar.component';
import { NavBarSliderComponent } from './nav-bar-slider/nav-bar-slider.component';
import { NavbarComponent } from './navbar/navbar.component';
import { GenerateKeyPairsComponent } from './generate-key-pairs/generate-key-pairs.component';
import { InfoBarComponent } from './info-bar/info-bar.component';
import { OurFeaturesComponent } from './our-features/our-features.component';
import { PopupNoteComponent } from './popup-note/popup-note.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { TransactionBarComponent } from './transaction-bar/transaction-bar.component';
import { TransferTokensComponent } from './transfer-tokens/transfer-tokens.component';
import { ErrorComponent } from './error/error.component';
import { TxhistoryComponent } from './txhistory/txhistory.component';
import { AccountInfoComponent } from './account-info/account-info.component';
import { AboutComponent } from './about/about.component';

/* Contracts Components*/
import { ContractsNavbarComponent } from './contracts/contracts-navbar/contracts-navbar.component';
import { ContractsComponent } from './contracts/contracts.component';
import { DeployAbiComponent } from './contracts/deploy-abi/deploy-abi.component';
import { DeployContractComponent } from './contracts/deploy-contract/deploy-contract.component';
import { InteractWithContractComponent } from './contracts/interact-with-contract/interact-with-contract.component';

/* Manage-Accounts Components*/
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

/* Manage-Voting Components*/
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

/* Other Components*/
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

/* PageNotFound Component*/
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  // {
  //   path: '', component: PageComponent,
  //   children: [
  { path: '', component: LandingpageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: CreateAccountComponent },
  { path: 'txhistory', component: TxhistoryComponent,canActivate: [AuthGuard] },
  { path: 'faucet', component: FaucetComponent },
  { path: 'findAccount', component: FindAccountComponent,canActivate: [AuthGuard]  },
  { path: 'transferTokens', component: TransferTokensComponent,canActivate: [AuthGuard] },
  { path: 'generateKeyPairs', component: GenerateKeyPairsComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'ourFeatures', component: OurFeaturesComponent },
  { path: 'premiumName', component: PremiumNameComponent },
  { path: 'infoBar', component: InfoBarComponent },
  { path: 'transactionBar', component: TransactionBarComponent },
  { path: 'nameBindsBar', component: NameBindsBarComponent },
  { path: 'accountInfo', component: AccountInfoComponent,canActivate: [AuthGuard]  },
  { path: 'about', component: AboutComponent },
  {
    path: 'contracts', component: ContractsComponent,
    children: [
      { path: '', redirectTo: 'interactWithContract', pathMatch: 'full' },
      { path: 'interactWithContract', component: InteractWithContractComponent },
      { path: 'deployContract', component: DeployContractComponent },
      { path: 'deployAbi', component: DeployAbiComponent }
    ]
  },
  {
    path: 'manageAccount', component: MainManageAccountComponent,
    children: [
      { path: '', redirectTo: 'delegate', pathMatch: 'full' },
      { path: 'delegate', component: DelegateComponent },
      { path: 'undelegate', component: UndelegateComponent },
      { path: 'buy-sell-ram', component: BuySellRamComponent },
      { path: 'link-unlink-permission', component: LinkUnlinkComponent },
      { path: 'delete-permission', component: DeletePermissionComponent },
      { path: 'advanced-permission', component: AdvancedPermissionsComponent },
      { path: 'set-ram', component: SetRamComponent },
      { path: 'refundStake', component: RefundStakeComponent },
      { path: 'get-permission', component: GetPermissionComponent },
    ]
  },
  {
    path: 'manageVoting', component: ManageVotingComponent,
    children: [
      { path: '', redirectTo: 'setProxy', pathMatch: 'full' },
      { path: 'createProxy', component: CreateProxyComponent },
      { path: 'setProxy', component: SetProxyComponent },
      { path: 'resignProxy', component: ResignProxyComponent },
      { path: 'registerProducer', component: RegisterProducerComponent },
      { path: 'removeProducer', component: RemoveProducerComponent },
      { path: 'setProducer', component: SetProducerComponent },
      { path: 'unregisterProducer', component: UnregisterProducerComponent },
      { path: 'voterProducer', component: VoterProducerComponent }
    ]
  },
  {
    path: 'other', component: OtherComponent,
    children: [
      { path: '', redirectTo: 'setPrivilege', pathMatch: 'full' },
      { path: 'setParams', component: SetParamsComponent },
      { path: 'premiumName', component: PremiumNameComponent},
      { path: 'claimRewards', component: ClaimRewardsComponent },
      { path: 'cancelDelay', component: CancelDelayComponent },
      { path: 'onError', component: OnErrorComponent },
      { path: 'setPrivilege', component: SetPrivilegeComponent },
      { path: 'setAccountLimits', component: SetAccountLimitsComponent },
      { path: 'setGlobalLimits', component: SetGlobalLimitsComponent },
    ]
  },

  { path: '**',component: ErrorComponent }
]
// }
// ]

@NgModule({
  imports: [RouterModule.forRoot(routes,
    {
      enableTracing: true,
      onSameUrlNavigation: 'reload'
    })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
