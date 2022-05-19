import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public httpOptions:any
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin" :"*"
      })
    };
   }


  // Signup api call
    doCreateAccount(accountName:string,ownerKey:string,activeKey:string) {
    const params = {
      accountName: accountName,
      ownerKey: ownerKey,
      activeKey: activeKey
    };


    return this.http
      .post<any>(`${environment.apiUrl}` +"createAccount",params, this.httpOptions)
      .pipe(
        map(response => {
          return response;

        })
      );
  }


  // Faucet api call
    doFaucetDRMC(accountName:string) {
    const params = {
      accountName: accountName
    };
    return this.http
      .post<any>(`${environment.apiUrl}` +"drmcFaucet",params, this.httpOptions)
      .pipe(
        map(response => {
          return response;

        })
      );
  }

  // Faucet api call
    doFaucetDRMI(accountName:string) {
    const params = {
      accountName: accountName
    };
    return this.http
      .post<any>(`${environment.apiUrl}` +"drmiFaucet",params, this.httpOptions)
      .pipe(
        map(response => {
          return response;

        })
      );
  }

}
