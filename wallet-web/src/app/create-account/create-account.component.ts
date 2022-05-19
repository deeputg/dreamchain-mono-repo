import { Component, Inject } from '@angular/core'
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { TranslateService } from '@ngx-translate/core'
import { SessionStorage } from 'ngx-webstorage'
import Eos from '../../assets/lib/eos'
import { LoginComponent } from '../login/login.component'
import { Account } from '../models/account.model'
import { LoginState } from '../models/login-state.model'
import { ButtonBlockService, DialogsService, LoginService} from '../services'
import { ApiService } from '../services/api.service'
import {Clipboard} from 'ts-clipboard';

const { ecc } = Eos.modules

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: [
    './create-account.component.scss',
    '../../input.style.scss',
    '../../button.styles.scss',
    '../../page-container.styles.scss',
    '../../icon.styles.scss'
  ]
})
export class CreateAccountComponent {
  public faQuestionCircle = faQuestionCircle
  public network: any
  public eos: any
  public sectionHide: boolean
  public sectionBtn: boolean
  @SessionStorage()
  public buttonUsed: boolean
  @SessionStorage()
  public isLoggedIn: LoginState
  @SessionStorage()
  public accountName: string
  @SessionStorage()
  public permission: string
  @SessionStorage()
  public currentPluginName: string
  @SessionStorage()
  public faucetkey: string;
  @SessionStorage()
  public notLogin: boolean;

  public model: Account

  public privKeyOwner: string
  public pubKeyOwner: string
  public privKeyActive: string
  public pubKeyActive: string
  public accountNameC:string
  public

  constructor (
    public dialogRef: MatDialogRef<CreateAccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public buttonBlockService: ButtonBlockService,
    private dialogsService: DialogsService,
    private translate: TranslateService,
    public loginService: LoginService,
    private router: Router,
    private apiService:ApiService
  ) {
    this.sectionHide = true
    this.sectionBtn = true
    this.pubKeyActive
    this.privKeyActive
    this.privKeyOwner
    this.pubKeyOwner
    this.buttonUsed = false
    this.model = new Account('', "signupdrcdrc", '', '', 1, 1, 8192, false)

  }
  public ngOnInit () {}

  public loggedIn () {
    if (this.isLoggedIn != null && this.isLoggedIn !== LoginState.out) {
      return true
    } else {
      return false
    }
  }

    copypubKeyActive(){
        Clipboard.copy("Public Key : " + this.pubKeyActive);
        tippy('#pubKeyActive',{position:'right',
        animation:'scale', trigger:'click'
        });
    }

    copyprivKeyActive(){
        Clipboard.copy("Private Key : " + this.privKeyActive);
        tippy('#privKeyActive',{position:'right',
        animation:'scale', trigger:'click'
        });
    }

  // under plugin works only with active key
  // works with owner or active when user is logged in with keys
  public async createAccount (model) {
    this.buttonUsed = true
    const message = await this.translate.get(`dialogs.${this.currentPluginName}-should-appear`).toPromise()
    const title = await this.translate.get('dialogs.transaction-wil-be-sent').toPromise()
    this.dialogsService.showSending(message, title)
    this.accountNameC= model.name.toLowerCase();

    // let data: any = this.loginForm.value;
    this.apiService.doCreateAccount(this.accountNameC,this.pubKeyOwner,this.pubKeyActive)
    .subscribe(
      (data: any) => {
        if(data.status){
          this.dialogsService.showSuccess("Account Sucessfully Created.")
          this.router.navigateByUrl('/login');
        }
        else{
          this.dialogsService.showFailure(data.error)
        }
      }
    );

  }

  public async onSubmit () {
    await this.createAccount(this.model)
  }

  public async onKeySubmit () {
    ecc.randomKey().then(privateKey => {
      this.privKeyActive = privateKey // wif
      this.pubKeyActive = ecc.privateToPublic(privateKey)

    })

    ecc.randomKey().then(privateKey => {
      this.privKeyOwner = privateKey // wif
      this.pubKeyOwner = ecc.privateToPublic(privateKey)
    })

    this.sectionBtn = false
  }


  public continueClick()
  {
    this.sectionHide = false
  }

}
