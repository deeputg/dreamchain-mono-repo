// Login Page
// @author Linto Thomas (linto@netobjex.com)
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DrmService } from '../../../services/drm.service';
import { ValidationService } from '../../../services/validation.service';
import { CryptoService } from '../../../services/crypto.service';
import Eos from '../../../../assets/lib/eos';
import { SessionStorage, SessionStorageService } from 'ngx-webstorage'
import Swal from 'sweetalert2';
const { ecc } = Eos.modules

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  afterKeyChange: boolean;
  public loginForm: FormGroup
  public privKey: string;
  public pubKey: string;
  public aName: string;
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

  constructor
    (
      public router: Router,
      public drmService: DrmService,
      public cryptoService: CryptoService,
      private formBuilder: FormBuilder,
    ) { }

  ngOnInit(): void {
    this.afterKeyChange = false;
    this.loginForm = this.formBuilder.group({
      privateKey: ['',[Validators.required, ValidationService.privateKeyValidator]]
    });
  }
  async onLoginChange() {
    if (this.loginForm.valid) {
      this.privKey = (this.loginForm.value).privateKey;
      try {
        this.pubKey = ecc.privateToPublic(this.privKey);
        let data
        data = await this.drmService.findByKey('{"public_key":"' + this.pubKey + '"}').toPromise()
        if (data && data.account_names.length) {
          this.aName = data.account_names[0];
          this.afterKeyChange = true;
        }
        if (!data || !data.account_names.length) {
          this.afterKeyChange = false;
          this.isLoggedIn = false;
          Swal.fire({
            title: 'Failed',
            text: 'No account has been enrolled using this key',
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'Done'
          }).then((result) => {
            if (result.value) {
              this.loginForm.reset();
              this.router.navigateByUrl('/login');
            }
          })
          return
        }

      } catch (err) {
        this.afterKeyChange = false;
        Swal.fire({
          title: 'Failed',
          text: 'Invalid private key, checksum failed.',
          icon: 'error',
          showCancelButton: false,
          confirmButtonText: 'Done'
        }).then((result) => {
          if (result.value) {
            this.loginForm.reset();
            this.router.navigateByUrl('/login');
          }
        })
        return
      }
    }
    else{
      this.afterKeyChange = false;
    }

  }

  async login() {
    if (this.privKey != '') {
      this.privateKey = this.cryptoService.encryptWithCryptoJS({ key: this.privKey, aName: this.aName });
      this.publicKey = this.cryptoService.encryptWithCryptoJS({ key: this.pubKey, aName: this.aName });
      this.accountName = this.aName;
      this.permission = "active";
      this.isLoggedIn = true;
      this.router.navigateByUrl('/dashboard');
    }
    else {
      this.privateKey = '';
      this.publicKey = '';
      this.accountName = '';
      this.permission = '';
      this.isLoggedIn = false;
      this.router.navigateByUrl('/login');
    }
  }

}
