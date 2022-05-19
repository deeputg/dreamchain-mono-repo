import { Injectable } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { SessionStorage } from 'ngx-webstorage'

declare var Eos: any

import * as Eos from 'eosjs'

@Injectable()
export abstract class BasePluginService {
  public ready: Promise<void>
  public plugin: any
  public eos: any
  public network: any
  public eosPluginIdentity: any
  public name: string
  public downloadLink: string

  @SessionStorage()
  public currentNetwork: string
  @SessionStorage()
  public currentChainId: string
  @SessionStorage()
  public port: number
  @SessionStorage()
  public protocol: string
  @SessionStorage()
  public accountName: string
  @SessionStorage()
  public permission: string

  constructor () {
    this.name = 'basePlugin'
  }

  public abstract async login ()
  public abstract logout ()
  public abstract load ()

  protected setNetwork () {
    this.network = {
      blockchain: 'eos',
      protocol: 'https',
      port: this.port,
      host: this.currentNetwork,
      chainId: this.currentChainId
    }
  }

  protected async requestIdentity (eosPluginIdentityFunction, networkParametrs) {
    const eosPluginIdentity = await eosPluginIdentityFunction(networkParametrs)
    if (!eosPluginIdentity) { throw new Error() }
    this.accountName = eosPluginIdentity.accounts[0].name
    this.permission = eosPluginIdentity.accounts[0].authority
    this.eosPluginIdentity = eosPluginIdentity
  }

  protected loadPlugin () {
    this.setNetwork()

    const protocol = this.protocol.substr(0, this.protocol.indexOf('://'))
    this.eos = this.plugin.eos(this.network, Eos, {}, protocol)
  }

}
