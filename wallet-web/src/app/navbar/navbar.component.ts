import { Component, OnInit, Output,EventEmitter, ViewChild } from '@angular/core'
import { MatDialog, MatDialogConfig, MatIconRegistry } from '@angular/material'
import { DomSanitizer } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { SessionStorage } from 'ngx-webstorage'
import { AddEditNetworkDialogComponent, ChangeLastNetworkDialogComponent, SelectAccountDialogComponent } from '../dialogs'
import { LoginState } from '../models/login-state.model'
import { Network, NetworkChaindId, NetworkProtocol } from '../models/network.model'
import { AccountService, ConfigService, CryptoService, FactoryPluginService, LoginService } from '../services/'
import { ModalService } from '../services/modal.service';
import { LoginComponent } from '../login/login.component';
import { CreateAccountComponent } from '../create-account/create-account.component';
import { ObservablesService } from '../services/observables.service';

export interface DropdownList {
  value: string
  viewValue: string
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: [
    './navbar.component.scss',
    '../../page-container.styles.scss',
    '../../dropdown.scss'
  ]
})
export class NavbarComponent {
  @SessionStorage()
  public isLoggedIn: LoginState
  @SessionStorage()
  public currentNetwork: string
  @SessionStorage()
  public userNetworks: Network[]
  @SessionStorage()
  public currentChainId: string
  @SessionStorage()
  public currentLanguage: string
  @SessionStorage()
  public protocol: string
  @SessionStorage()
  public port: number
  @SessionStorage()
  public accountName: string
  @SessionStorage()
  public selectedLanguage: string
  @SessionStorage()
  public selectedNetwork: string
  @SessionStorage()
  public selectedIdNetwork: number
  @SessionStorage()
  public lastIdNetwork: number
  @SessionStorage()
  public currentPluginName: string

  public toggleNav: boolean

  get loginIcon () {
    if (!this.isLoggedIn) {
      return 'logo'
    }
    if (this.isLoggedIn === LoginState.plugin) {
      return this.currentPluginName
    }
    if (this.isLoggedIn === LoginState.ledger) {
      return 'ledger'
    }
    else if (this.isLoggedIn === LoginState.publicKey) {
      return 'publicKey'
    }
    return 'logo'
  }

  public languages: DropdownList[] = [
    { value: 'en', viewValue: 'English' },
    { value: 'de', viewValue: 'German' },
    { value: 'fr', viewValue: 'French' },
    { value: 'ru', viewValue: 'Russian' }
  ]

  public networks: Network[]

  constructor (
    private observables: ObservablesService,
    private modalService: ModalService,
    public dialog: MatDialog,
    private factoryPluginService: FactoryPluginService,
    private router: Router,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private translate: TranslateService,
    public loginService: LoginService,
    private accountService: AccountService,
    private cryptoService: CryptoService
  ) {

    this.toggleNav = false

    this.networks = []

    this.networks.push(new Network(
      '15.206.79.84',
      'Dreamchain Network',
      NetworkChaindId.MainNet,
      8888,
      NetworkProtocol.Http
    ))
    this.networks.push(new Network(
      '15.206.79.84',
      'Dreamchain Network',
      NetworkChaindId.MainNet,
      8888,
      NetworkProtocol.Http
    ))

    if (this.userNetworks) {
      this.userNetworks.forEach(network => {
        this.networks.push(network)
      })
    } else {
      this.userNetworks = []
    }

    if (!this.selectedNetwork) {
      this.networkChanged(0)
    }

    iconRegistry.addSvgIcon(
      'link-icon',
      sanitizer.bypassSecurityTrustResourceUrl('../assets/svg/link.svg'))

      iconRegistry.addSvgIcon(
        'sign-out-icon',
        sanitizer.bypassSecurityTrustResourceUrl('../assets/svg/sign-out.svg'))

        if (this.currentLanguage == null) {
          this.currentLanguage = 'en'
        }
        this.selectedLanguage = this.currentLanguage
        this.translate.use(this.selectedLanguage)

        if (this.currentNetwork == null) {
          this.currentNetwork = ConfigService.settings.eos.host
          this.port = ConfigService.settings.eos.port
          this.protocol = ConfigService.settings.eos.protocol
        }

        if (this.currentNetwork != this.selectedNetwork) {
          this.selectedNetwork = this.currentNetwork
          this.changeChainId()
        }

        if (this.selectedIdNetwork === null) {
          for (let i = 0; i < this.networks.length; i++) {
            if (this.networks[i].host === this.currentNetwork) {
              this.selectedIdNetwork = i
              break
            }
          }
        }

      }

      public ngOnInit () {
        this.observables.dynamicUserLogged.subscribe();
      }

      public displayLogOut () {
        if (this.isLoggedIn != null && this.isLoggedIn !== LoginState.out) {
          return true
        } else {
          return false
        }
      }

      public activeLink (currentRoute) {
        if (this.router.url.indexOf('/' + currentRoute) === 0) {
          return true
        } else {
          return false
        }
      }

      public async logout () {
        this.observables.changeUserLogged(false);
        await this.loginService.logout()
      }

      public langChanged () {
        this.currentLanguage = this.selectedLanguage
        this.translate.use(this.selectedLanguage)
      }

      public networkChanged (index: number) {
        this.selectedNetwork = this.networks[index].host
        if (this.selectedNetwork) {
          this.changeChainId(index)
        }
      }

      public async changeChainId (index: number = -1) {
        if (index === -1) {
          for (let i = 0; i < this.networks.length; i++) {
            const network = this.networks[i]
            if (network.host === this.currentNetwork) {
              this.setNetwork(i)
              break
            }
          }
        } else {
          this.setNetwork(index)
        }

        // suggest new network if logged in with plugin
        if ((this.isLoggedIn === LoginState.plugin) || (this.isLoggedIn == null)) {

          let rez = await this.loginPlugin()
          if (rez) {
            this.lastIdNetwork = this.selectedIdNetwork
          } else {
            if (this.lastIdNetwork === null) {
              this.logout()
            }

            const dialogRef = this.dialog.open(ChangeLastNetworkDialogComponent)
            await dialogRef.afterClosed().subscribe(async result => {
              if (result) {
                this.selectedNetwork = this.networks[this.lastIdNetwork].host
                this.setNetwork(this.lastIdNetwork)
                rez = await this.loginPlugin(false)
                if (rez) {
                  this.lastIdNetwork = this.selectedIdNetwork
                } else {
                  this.lastIdNetwork = null
                  this.logout()
                }
              } else {
                this.lastIdNetwork = null
                this.logout()
              }
            })
          }
        } else if (this.isLoggedIn === LoginState.publicKey) {
          const isLogin = await this.loginKey()
          if (isLogin) {
            this.lastIdNetwork = this.selectedIdNetwork
          } else {
            if (this.lastIdNetwork === null) {
              this.logout()
            }
            const dialogRef = this.dialog.open(ChangeLastNetworkDialogComponent)
            await dialogRef.afterClosed().subscribe(async result => {
              if (result) {
                this.selectedNetwork = this.networks[this.lastIdNetwork].host
                this.setNetwork(this.lastIdNetwork)
                if (this.loginKey()) {
                  this.lastIdNetwork = this.selectedIdNetwork
                } else {
                  this.lastIdNetwork = null
                  this.logout()
                }
              } else {
                this.lastIdNetwork = null
                this.logout()
              }
            })
          }

        } else if (this.isLoggedIn === LoginState.out) {
          this.logout()
        }
      }

      public async loginKey () {
        const pubKey = this.cryptoService.decrypt(this.loginService.publicKey, this.loginService.pass)
        let data
        for (let i = 0; i < 10; i++) {
          data = await this.accountService.findByKey('{"public_key":"' + pubKey + '"}').toPromise()
          if (data && data.account_names.length) {
            break
          }
        }

        if (!data || !data.account_names.length) {
          return false
        }
        const accountNotFoundMesage = this.translate.get('dialogs.account-not-found').toPromise()

        let success = false
        const callback = (accountName = '', permission = ''): void => {
          if (accountName && permission) {
            this.accountName = accountName
            this.loginService.permission = permission
            success = true
          }
        }

        await this.selectPermission(data, callback)
        return success
      }

      public async selectPermission (data, callback: (accountName, permission) => any) {
        if (data == null) {
          callback('', '')
          return
        }
        const self = this
        const accounts = []
        for (const account of data.account_names) {
          const permissions = await self.accountService.findByName('{"account_name":"' + account + '"}').toPromise()
          if (permissions) {
            for (const item of permissions.permissions) {
              accounts.push([account.toString(), item.perm_name])
            }
          }
        }
        if (accounts.length === 0) {
          callback('', '')
          return
        }
        const dialogConfig = new MatDialogConfig()
        dialogConfig.closeOnNavigation = false
        dialogConfig.disableClose = true
        dialogConfig.data = { accounts }

        const dialogRef = this.dialog.open(SelectAccountDialogComponent, dialogConfig)
        const result = await dialogRef.afterClosed().toPromise()
        callback(result.data.split(',')[0], result.data.split(',')[1])
      }

      public async loginPlugin (forgetIdentity = true) {
        const currentPlugin = this.factoryPluginService.currentPlugin
        await currentPlugin.ready

        if (forgetIdentity && currentPlugin.plugin.identity) {
          await currentPlugin.plugin.forgetIdentity()
        }

        let isLoginned = false
        try {
          await currentPlugin.login()
          const currentRoute = this.router.url
          this.router.navigate(['/']).then(() => {
            this.router.navigate([currentRoute])
          })
          isLoginned = true
        } catch (error) {
          isLoginned = false
        }

        return isLoginned
      }

      public setNetwork (index) {
        this.currentNetwork = this.networks[index].host
        this.currentChainId = this.networks[index].currentChainId
        this.port = this.networks[index].port
        this.protocol = this.networks[index].protocol
        this.selectedIdNetwork = index
      }

      public addNetwork () {
        const dialogConfig = new MatDialogConfig()
        dialogConfig.closeOnNavigation = false
        dialogConfig.disableClose = true
        dialogConfig.data = { networks: this.networks }

        const dialogRef = this.dialog.open(AddEditNetworkDialogComponent, dialogConfig)
        dialogRef.afterClosed().subscribe(result => {
          if (result.data) {
            const arrayUserNetworks = (this.userNetworks) ? this.userNetworks : []
            arrayUserNetworks.push(result.data)
            this.userNetworks = arrayUserNetworks
            this.networks.push(result.data)

            this.selectedNetwork = result.data.host
          }
          if (this.currentNetwork) {
            this.selectedNetwork = this.currentNetwork
          } else {
            if (this.networks.length) {
              this.currentNetwork = this.selectedNetwork = this.networks[0].host
              this.changeChainId()
            }
          }
        })
      }

      public editNetwork (index: number) {
        const dialogConfig = new MatDialogConfig()
        dialogConfig.closeOnNavigation = false
        dialogConfig.disableClose = true
        dialogConfig.data = { networks: this.networks, network: this.networks[index] }

        const dialogRef = this.dialog.open(AddEditNetworkDialogComponent, dialogConfig)
        dialogRef.afterClosed().subscribe(result => {
          let dataHostDeleteNetwork = ''
          if (result.data) {

            if (result.data.removed) {
              for (let i = 0; i < this.userNetworks.length; i++) {
                if (this.userNetworks[i] === this.networks[index]) {
                  dataHostDeleteNetwork = this.networks[index].host
                  this.userNetworks.splice(i, 1)
                  this.userNetworks = this.userNetworks
                }
              }
              this.networks.splice(index, 1)
            } else {
              result.data.isCustome = true
              this.networks[index] = result.data
            }

          }
          if (this.currentNetwork && dataHostDeleteNetwork !== this.currentNetwork) {
            this.selectedNetwork = this.currentNetwork
          } else {
            if (this.networks.length) {
              this.currentNetwork = this.selectedNetwork = this.networks[0].host
              this.changeChainId()
            }
          }
        })
      }


    }
