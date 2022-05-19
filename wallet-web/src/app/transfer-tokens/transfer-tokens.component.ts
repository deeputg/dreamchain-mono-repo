import { Component, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Router, RouterModule } from '@angular/router'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { TranslateService } from '@ngx-translate/core'
import * as _ from 'lodash'
import { PapaParseService } from 'ngx-papaparse'
import { SessionStorage } from 'ngx-webstorage'
import { LoginState } from '../models/login-state.model'
import { Transfer } from '../models/transfer.model'
import { ButtonBlockService, CryptoService, DialogsService, FactoryPluginService, InfoBarService, LoginService } from '../services'
import { TransactionBarComponent } from '../transaction-bar/transaction-bar.component'

@Component({
  selector: 'app-transfer-tokens',
  templateUrl: './transfer-tokens.component.html',
  styleUrls: [
    './transfer-tokens.component.scss',
    '../../icon.styles.scss',
    '../../input.style.scss',
    '../../button.styles.scss',
    '../../page-container.styles.scss'
  ]
})
export class TransferTokensComponent {
  public faQuestionCircle = faQuestionCircle
  public network: any
  public eos: any

  @SessionStorage()
  public accountName: string
  @SessionStorage()
  public permission: string
  @SessionStorage()
  public currentChainId: string
  @SessionStorage()
  public isLoggedIn: LoginState
  @SessionStorage()
  public publicKey: string
  @SessionStorage()
  public buttonUsed: boolean
  @SessionStorage()
  public currentPluginName: string
  @SessionStorage()
  public faucetkey: string;

  public symbols: string[][]

  public model: Transfer[]
  public lastColorIsWhite = true

  @ViewChild(TransactionBarComponent) public bar: TransactionBarComponent

  constructor (
    public loginService: LoginService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private dialogsService: DialogsService,
    private cryptoService: CryptoService,
    public buttonBlockService: ButtonBlockService,
    public factoryPluginService: FactoryPluginService,
    private papa: PapaParseService,
    private info: InfoBarService,
    private router: Router
  ) {
    this.model = []
    this.model.push(new Transfer('', '', '', null, ''))
    this.buttonUsed = false
    this.symbols = info.userSymbol
    // this.dialogsService.showSending(this.symbols)
  }

  public async transferTokens (model) {
    this.buttonUsed = true
    this.faucetkey="";
    this.loginService.setupEos().then(async obj => {
      this.eos = obj.eos;
      this.network = obj.network
      const options = { authorization: [`${this.accountName}@${this.permission}`] }

      const message = await this.translate.get(`dialogs.${this.currentPluginName}-should-appear`).toPromise()
      const title = await this.translate.get('dialogs.transaction-wil-be-sent').toPromise()
      this.dialogsService.showSending(message, title)
      try {
        for (const item of model) {
          const tokenItem = this.symbols.filter(p => p[0] == item.symbol);
          const account = tokenItem[0][1]
          const precision = Number(tokenItem[0][2])
          await this.eos.transaction(account, tr => {
            tr.transfer(this.accountName, item.recipient.toLowerCase(), item.quantity.toFixed(precision) + ' ' + item.symbol, item.memo, options)
        })
      }

        this.dialogsService.showSuccess(await this.translate.get('transfer-tokens.transfer-completed').toPromise())

        this.router.navigateByUrl('/accountInfo');
      } catch (err) {
        console.log(err);
        if (err.code === 402) {
          this.dialogsService.showInfo(err.message)
        } else {
          this.dialogsService.showFailure(err)
        }
        this.buttonUsed = false
      }
    })
  }

  public addRow () {
    this.model.push(new Transfer('', '', '', null, ''))
    this.lastColorIsWhite = !this.lastColorIsWhite
  }

  public removeRow (index) {
    if (this.model.length > 1 && index > 0) {
      this.model.splice(index, 1)
      this.lastColorIsWhite = !this.lastColorIsWhite
    }
  }

  public async onSubmit () {
    await this.transferTokens(this.model)
    this.router.navigateByUrl('/accountInfo');

  }

  public attachFile (event, file) {
    // Recipient;Memo;0.01;Symbol
    const self = this
    this.papa.parse(file.files[0], {
      download: true,
      complete: (results) => {
        this.model = []
        results.data.forEach(element => {
          const arr = element
          self.model.push(new Transfer(element[0], '', element[1], +element[2], element[3]))
        })
      }
    })
  }

  public doFilterSymbols (value: string) {
    return this.symbols.filter(symbol => symbol[0].toUpperCase().indexOf(value.toUpperCase()) !== -1)
  }

}
