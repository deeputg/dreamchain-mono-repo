import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { SessionStorage } from 'ngx-webstorage'
import { LoginState } from './models/login-state.model'
import { TranslateService } from '@ngx-translate/core'
import { LoginService } from './services/'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    '../page-container.styles.scss',
    './app.component.scss'
  ]
})

export class AppComponent {
  @SessionStorage()
  public isLoggedIn: LoginState
  @SessionStorage()
  public state: boolean

  public title = 'app'

  constructor (public router: Router, public loginService: LoginService) {

  }

  public displayOneContent () {
    return (this.isLoggedIn != null && this.isLoggedIn !== LoginState.out) ||
      (this.router.url === '/login')
  }

  public hideLogin () {
    return (
      (this.router.url === '/generateKeyPairs') ||
      (this.router.url === '/findAccount') ||
      (this.router.url === '/faq') ||
      (this.router.url === '/ourFeatures')
    )
  }


  public displayInfoBar () {
    return (this.isLoggedIn != null && this.isLoggedIn !== LoginState.out)
  }

}
