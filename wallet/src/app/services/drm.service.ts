import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, map } from "rxjs/operators";
import { forkJoin, Observable, of } from 'rxjs'
import { environment } from "../../environments/environment";
import { SessionStorage, SessionStorageService } from 'ngx-webstorage';
import Eos from '../../assets/lib/eos';
import { CryptoService } from '../services/crypto.service';


@Injectable({
  providedIn: 'root'
})
export class DrmService {
  public protocol: string
  public host: string
  public port: string
  public chainId: string

  @SessionStorage()
  public isLoggedIn: boolean

  @SessionStorage()
  public privateKey: string

  @SessionStorage()
  public publicKey: string

  @SessionStorage()
  public accountName: string

  @SessionStorage()
  public permission: string

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private cryptoService: CryptoService
  ) {
    this.protocol = environment.protocol;
    this.host = environment.host;
    this.port = environment.port;
    this.chainId = environment.chainId;
  }

  public findByName(body: string): Observable<any> {
    return this.httpClient.post(this.protocol + this.host + ':' + this.port + '/v1/chain/get_account', body).pipe(
      catchError(err => {
        return of(false)
      })
    )
  }

  public findByKey(body: string): Observable<any> {
    return this.httpClient.post(this.protocol + this.host + ':' + this.port + '/v1/history/get_key_accounts', body).pipe(
      catchError(err => {
        return of(false)
      })
    )
  }
 
  public getActions(body: string): Observable<any> {
    return this.httpClient.post(this.protocol + this.host + ':' + this.port + '/v1/history/get_actions', body).pipe(
      catchError(err => {
        return of(false)
      })
    )
  }

  public getCurrencyBalance(body: string): Observable<any> {
    return this.httpClient.post(this.protocol + this.host + ':' + this.port + '/v1/chain/get_currency_balance', body).pipe(
      catchError(err => {
        return of(false)
      })
    )
  }

  public async getAllTokenInfo(accountName) {
    let promise = new Promise(async (resolve, reject) => {
      if (this.isLoggedIn) {
        const drmcBalance = await this.getCurrencyBalance('{"code":"eosio.token","account":"' + accountName + '","symbol":"DRMC"}').toPromise();
        const drmiBalance = await this.getCurrencyBalance('{"code":"eosio.token","account":"' + accountName + '","symbol":"DRMI"}').toPromise();
        const data = [
          drmcBalance.length > 0 ? drmcBalance[0] : "0 DRMC",
          drmiBalance.length > 0 ? drmiBalance[0] : "0 DRMI"
        ];
        resolve(data);
      }
      else {
        reject('Not logged in');
      }
    });
    return promise;
  }

  public getAccountInfo() {
    let promise = new Promise(async (resolve, reject) => {
      if (this.isLoggedIn) {
        const drmcBalance = await this.getCurrencyBalance('{"code":"eosio.token","account":"' + this.accountName + '","symbol":"DRMC"}').toPromise();
        const drmiBalance = await this.getCurrencyBalance('{"code":"eosio.token","account":"' + this.accountName + '","symbol":"DRMI"}').toPromise();
        const data = {
          accountName: this.accountName,
          drmcBalance: drmcBalance.length > 0 ? drmcBalance[0] : "0 DRMC",
          drmiBalance: drmiBalance.length > 0 ? drmiBalance[0] : "0 DRMI"
        };
        resolve(data);
      }
      else {
        reject('Not logged in');
      }
    });
    return promise;

  }

  public async transferTokens(data: any) {
    let promise = new Promise(async (resolve, reject) => {
      try {
        const decodedKey = this.cryptoService.decryptionWithCryptoJS({ key: this.privateKey, aName: this.accountName });
        const drm = Eos({
          httpEndpoint: this.protocol + this.host + ":" + this.port,
          chainId: this.chainId,
          keyProvider: [decodedKey]
        });
        const options = { authorization: [`${this.accountName}@${this.permission}`] }
        const result = await drm.transaction("eosio.token", tr => {
          tr.transfer(this.accountName, data.recipient.toLowerCase(), data.quantity.toFixed(4) + ' ' + data.symbol.toUpperCase(), data.memo, options)
        })
        if (result.code == 500) {
          reject(result);
        }
        else {
          resolve(true);
        }

      }
      catch (err) {
        reject(err);
      }
    });
    return promise;
  }

}
