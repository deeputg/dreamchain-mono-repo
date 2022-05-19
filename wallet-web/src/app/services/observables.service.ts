/**
* Services for Observables
* Services for various observables
* @author Jishna AV
*/
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ObservablesService {
  /**
  * changes loginState
  */

  private userLogged = new BehaviorSubject<boolean>(false);
  dynamicUserLogged = this.userLogged.asObservable();

  constructor() {}

  changeUserLogged (userLog){
    this.userLogged.next(userLog);
  }
}
