import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import * as _ from 'lodash'
import { SessionStorage } from 'ngx-webstorage'
import { forkJoin, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { ConfigService } from './config.service'

@Injectable()

export class AccountService {
  @SessionStorage()
  public currentNetwork: string
  @SessionStorage()
  public protocol: string
  @SessionStorage()
  public port: number

  constructor (private httpClient: HttpClient) {}

  public findByName (body: string): Observable<any> {
    return this.httpClient.post(this.protocol + this.currentNetwork + ':' + this.port + '/v1/chain/get_account' , body).pipe(
     catchError(err => {
       return of(false)
     })
   )
  }
  public findByKey (body: string): Observable<any> {
    return this.httpClient.post(this.protocol + this.currentNetwork + ':' + this.port + '/v1/history/get_key_accounts' , body).pipe(
      catchError(err => {
        return of(false)
      })
    )
  }
  public getTokenInfo (body: string): Observable<any> {
    return this.httpClient.post(this.protocol + this.currentNetwork + ':' + this.port + '/v1/chain/get_currency_balance' , body).pipe(
      catchError(err => {
        return of(false)
      })
    )
  }

  public getTokensGreymass (accountName: string): Observable<any> {
    return this.httpClient.post(
      ConfigService.settings.eosTokens.greymass, '{"account":"' + accountName + '"}').pipe(
      catchError(err => {
        return of(false)
      })
    )
  }


  public getTokensEosflare (accountName: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    return this.httpClient.post(
      ConfigService.settings.eosTokens.eosflare, '{"account":"' + accountName + '"}', httpOptions).pipe(
      catchError(err => {
        return of(false)
      })
    )
  }

  public getAllTokensInfo (tokens: string[][], accountName) {
    if (_.isEmpty(tokens)) {
      return of([])
    }
    return forkJoin(tokens.map(token => this.getTokenInfo('{"code":"' + token[0] + '","account":"' + accountName + '"}')))
      .pipe(map(result => {
        return result.filter(item => item !== false && item.length > 0)
      }))
  }

  public getChainInfo (): Observable<any> {
    return this.httpClient.post(this.protocol + this.currentNetwork + ':' + this.port + '/v1/chain/get_info','').pipe(
      catchError(err => {
        return of(false)
      })
    )
  }

  public getActions (body: string): Observable<any> {
    return this.httpClient.post(this.protocol + this.currentNetwork + ':' + this.port + '/v1/history/get_actions', body).pipe(
      catchError(err => {
        return of(false)
      })
    )
  }

  public getProducers (): Observable<any> {
    return this.httpClient.post(this.protocol + this.currentNetwork + ':' + this.port + '/v1/chain/get_producers',
      JSON.stringify({ json: true })).pipe(
        catchError(err => {
          return of(false)
        })
      )
  }

  public getCurrentCourse (): Observable<any> {
    const custHeaders = new HttpHeaders().set('Referrer-Policy', 'no-referrer')
    return this.httpClient.get('https://api.coingecko.com/api/v3/coins/eos').pipe(
      catchError(err => {
        return of(false)
      })
    )
  }
}
