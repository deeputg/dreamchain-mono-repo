import { Injectable } from '@angular/core'
import { SessionStorage } from 'ngx-webstorage'
@Injectable({
  providedIn: 'root'
})

export class ButtonBlockService {
  @SessionStorage()
  buttonUsed: boolean

  buttonBlocked () {
    return (this.buttonUsed === true)
  }
}
