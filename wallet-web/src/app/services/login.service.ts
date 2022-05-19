import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { SessionStorage, SessionStorageService } from "ngx-webstorage";
import * as LedgerActions from "../../ledger";
import { LoginState } from "../models/login-state.model";
import { AccountService } from "./account.service";
import { ConfigService } from "./config.service";
import { CryptoService } from "./crypto.service";
import { FactoryPluginService } from "./plugins";

import Eos from '../../assets/lib/eos'
const { ecc } = Eos.modules;

@Injectable({
  providedIn: "root"
})
export class LoginService {
  @SessionStorage()
  public publicKey: string;
  @SessionStorage()
  public privateKey: string;
  @SessionStorage()
  public isLoggedIn: LoginState;
  @SessionStorage()
  public accountName: string;
  @SessionStorage()
  public permission: string;
  @SessionStorage()
  public currentNetwork: string;
  @SessionStorage()
  public currentChainId: string;
  @SessionStorage()
  public port: number;
  @SessionStorage()
  public protocol: string;
  @SessionStorage()
  public pass: string;
  @SessionStorage()
  public remember: boolean;
  @SessionStorage()
  public faucetkey: string;
  @SessionStorage()
  public notLogin: boolean;

  constructor(
    private factoryPluginService: FactoryPluginService,
    private accountService: AccountService,
    private cryptoService: CryptoService,
    private router: Router,
    private storage: SessionStorageService,
    private translations: TranslateService
  ) {}

  public loggedIn() {
    if (this.isLoggedIn != null && this.isLoggedIn !== LoginState.out) {
      return true;
    } else {
      return false;
    }
  }

  public withoutPass() {
    if (this.isLoggedIn === LoginState.publicKey && !this.remember) {
      return true;
    } else {
      return false;
    }
  }

  public async logout() {
    if (
      this.isLoggedIn === LoginState.plugin &&
      this.factoryPluginService.currentPlugin.plugin.eosPluginIdentity
    ) {
      await this.factoryPluginService.currentPlugin.plugin.forgetIdentity();
    }
    this.isLoggedIn = LoginState.out;
    this.router.navigate(["/"]);
    this.removePass();
  }

  public removePass() {
    this.storage.clear("pass");
    if (!this.remember) {
      this.storage.clear("hashedpass");
    }
    this.storage.clear("accountName");
    this.storage.clear("permission");
  }

  public removePasswordData() {
    this.storage.clear("privateKey");
    this.storage.clear("publicKey");
    this.storage.clear("pass");
    this.storage.clear("accountName");
    this.storage.clear("permission");
    this.storage.clear("hashedpass");
  }

  public async getPublicKey(key: string = "") {
    // return public key if private key was provided
    if (key) {
      try {
        return ecc.privateToPublic(key);
      } catch {
        return "";
      }
    }

    // return public key from Plugin
    await this.factoryPluginService.currentPlugin.login();
    return this.factoryPluginService.currentPlugin.eosPluginIdentity.publicKey;
  }

  public async setupEos() {
    if (this.currentNetwork == null) {
      this.currentNetwork = ConfigService.settings.eos.host;
      // alert(this.currentNetwork)
    }

    const net = await this.accountService.getChainInfo().toPromise();
    this.currentChainId = net.chain_id;

    const network = {
      blockchain: "eos",
      port: this.port,
      protocol: "http",
      host: this.currentNetwork,
      chainId: this.currentChainId
    };

    let eos;

    if (this.isLoggedIn === LoginState.plugin) {
      await this.factoryPluginService.currentPlugin.ready;
      if (!this.factoryPluginService.currentPlugin) {
        alert(
          await this.translations
            .get(`errors.${this.factoryPluginService.currentPlugin.name}-not`)
            .toPromise()
        );
        return;
      }
      // eos = (window as any).eosPlugin.eos(network, Eos, {}, 'https')
      eos = this.factoryPluginService.currentPlugin.plugin.eos(
        network,
        Eos,
        {},
        "https"
      );
      // const eosPluginIdentity = await (window as any).eosPlugin.getIdentity(network)

      const eosPluginIdentity = await this.factoryPluginService.currentPlugin.plugin.getIdentity(
        network
      );
      const eosAccount = eosPluginIdentity.accounts.find(
        account => account.blockchain === "eos"
      );
      this.accountName = eosAccount.name;
      this.permission = eosAccount.authority;
    } else if (this.isLoggedIn === LoginState.publicKey) {
      let decodedPrivateKey;
      if (this.faucetkey == "") {
        decodedPrivateKey = this.cryptoService.decrypt(this.privateKey);
        // alert(decodedPrivateKey);
      }
      else {
        // alert(decodedPrivateKey);
        decodedPrivateKey = this.faucetkey;
        this.faucetkey = "";
      }

      eos = Eos({
        httpEndpoint: this.protocol + this.currentNetwork + ":" + this.port,
        chainId: this.currentChainId,
        keyProvider: [decodedPrivateKey]
      });
    } else if (this.notLogin === true) {
      let decodedPrivateKey;
      if (this.faucetkey == "") {
        decodedPrivateKey = this.cryptoService.decrypt(this.privateKey);
      }
      else {
        decodedPrivateKey = this.faucetkey;
        this.faucetkey = "";
      }

      eos = Eos({
        httpEndpoint: this.protocol + this.currentNetwork + ":" + this.port,
        chainId: this.currentChainId,
        keyProvider: [decodedPrivateKey]
      });
    } else if (this.isLoggedIn === LoginState.ledger) {
      eos = await LedgerActions.setupEos(
        this.protocol + this.currentNetwork + ":" + this.port,
        this.currentChainId
      );
    }

    return {
      network,
      eos,
      account: this.accountName
    };
  }

  public async setupPluginEos() {
    if (this.currentNetwork == null) {
      this.currentNetwork = ConfigService.settings.eos.host;
      // alert("2"+this.currentNetwork)
    }

    const net = await this.accountService.getChainInfo().toPromise();
    this.currentChainId = net.chain_id;

    let eos;
    await this.factoryPluginService.currentPlugin.ready;
    if (!this.factoryPluginService.currentPlugin) {
      alert(
        await this.translations
          .get(`errors.${this.factoryPluginService.currentPlugin.name}-not`)
          .toPromise()
      );
      return;
    }
    eos = Eos({
      httpEndpoint: this.protocol + this.currentNetwork + ":" + this.port,
      chainId: this.currentChainId,
      keyProvider: [this.factoryPluginService.currentPlugin.plugin]
    });

    return eos;
  }

  public async getFullOptions(privateKey: string = "") {
    let options;

    if (this.isLoggedIn === LoginState.publicKey) {
      let pubKey = "";

      if (
        (this.privateKey == null || this.privateKey === "") &&
        this.publicKey
      ) {
        pubKey = this.cryptoService.decrypt(this.publicKey);
      } else if (privateKey.length > 0) {
        pubKey = await this.getPublicKey(privateKey);
      } else {
        return {};
      }

      options = {
        broadcast: true,
        sign: true,
        authorization: [
          { actor: this.accountName, permission: this.permission }
        ],
        verbose: true,
        keyProvider: pubKey,
        chainId: this.currentChainId // required to sign transaction
      };
    } else {
      options = {
        broadcast: true,
        sign: true,
        authorization: [
          { actor: this.accountName, permission: this.permission }
        ],
        verbose: true,
        chainId: this.currentChainId // required to sign transaction
      };
    }
    return options;
  }
}
