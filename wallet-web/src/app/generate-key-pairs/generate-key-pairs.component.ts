import { Component, OnInit } from '@angular/core'
import { SessionStorage } from 'ngx-webstorage'
import { LoginState } from '../models/login-state.model'
import { ConfigService } from '../services/config.service'
import Eos from '../../assets/lib/eos'
import { LoginComponent } from '../login/login.component'

let { ecc } = Eos.modules

@Component({
  selector: 'app-generate-key-pairs',
  templateUrl: './generate-key-pairs.component.html',
  styleUrls: [
    './generate-key-pairs.component.scss',
    '../../page-container.styles.scss',
    '../../input.style.scss',
    '../../button.styles.scss'
  ]
})

export class GenerateKeyPairsComponent implements OnInit {

  @SessionStorage()
  public isLoggedIn: LoginState

  public privKeyOwner: string
  public pubKeyOwner: string
  public privKeyActive: string
  public pubKeyActive: string


  constructor () {
    this.pubKeyActive
    this.privKeyActive
    this.privKeyOwner
    this.pubKeyOwner
  }

  public loggedIn () {
    return (this.isLoggedIn != null && this.isLoggedIn !== LoginState.out)
  }

  public ngOnInit () {

  }


  public async onSubmit () {
    ecc.randomKey().then(privateKey => {
      this.privKeyActive = privateKey // wif
      this.pubKeyActive = ecc.privateToPublic(privateKey)

    })

    ecc.randomKey().then(privateKey => {
      this.privKeyOwner = privateKey // wif
      this.pubKeyOwner = ecc.privateToPublic(privateKey)

    })
  }
}
