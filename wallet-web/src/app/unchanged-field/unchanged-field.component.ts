import { Component, Input, OnInit } from '@angular/core'
import { SessionStorage } from 'ngx-webstorage'
import { LoginState } from '../models/login-state.model'
import { LoginService } from '../services/login.service'

import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms'
// import { promisify } from 'util'
// import custom = module

@Component({
  selector: 'app-unchanged-field',
  templateUrl: './unchanged-field.component.html',
  styleUrls: ['./unchanged-field.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: UnchangedFieldComponent, multi: true }
  ]
})

export class UnchangedFieldComponent implements OnInit, ControlValueAccessor {

  @SessionStorage()
  accountName: string

  @SessionStorage()
  permission: string

  @SessionStorage()
  isLoggedIn: LoginState

  @Input() childMessage: string
  @Input() hidePermission: boolean

  constructor (public loginService: LoginService) { }

  accountInfo: string

  ngOnInit () {
    if (this.isLoggedIn !== LoginState.out) {
      this.accountInfo = this.accountName
    }
  }

  writeValue (value: any) {  }

  registerOnChange (fn: () => void): void { }

  registerOnTouched (fn: () => void): void { }

}
