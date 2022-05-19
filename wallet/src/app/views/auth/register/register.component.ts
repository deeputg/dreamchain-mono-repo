// Register Page
// @author Linto Thomas (linto@netobjex.com)
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Eos from '../../../../assets/lib/eos';
import { ApiService } from '../../../services/api.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';
import Swal from 'sweetalert2';
import * as copy from 'copy-to-clipboard';

const { ecc } = Eos.modules

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  afterKeyGen: boolean;
  constructor(
    public router: Router,
    private apiService: ApiService,
    private formBuilder: FormBuilder
  ) {

  }
  public registerForm: FormGroup;
  public privateKey: string;
  public publicKey: string;
  public isCopyPublicKey: boolean;
  public isCopyPrivateKey: boolean;

  ngOnInit(): void {
    this.afterKeyGen = false;
    this.isCopyPublicKey = false;
    this.isCopyPrivateKey = false;
    this.generateKeypair();
    this.registerForm = this.formBuilder.group({
      accountName: ['', [Validators.required, ValidationService.accountNameValidator]]
    });
  }
  onContinue() {
    this.afterKeyGen = true;
  }

  // Function to generate keypair, includes private key and public key for an account to be created.
  public async generateKeypair() {
    ecc.randomKey().then(privateKey => {
      this.privateKey = privateKey // wif
      this.publicKey = ecc.privateToPublic(privateKey)

    })

  }

  public async signup() {
    if (this.registerForm.valid) {
      const accountName = (this.registerForm.value).accountName;
      this.apiService.doCreateAccount(accountName.toLowerCase(), this.publicKey, this.publicKey)
        .subscribe(
          (data: any) => {
            console.log(data);
            if (data.status) {
              Swal.fire({
                title: 'Success',
                text: 'Your account has been created successfully',
                icon: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
              }).then((result) => {
                if (result.value) {
                  this.router.navigateByUrl('/');
                }
              })
            }
            else {
              if (data.error.code == "ECONNREFUSED") {
                Swal.fire({
                  title: 'Failed',
                  text: 'Failed to communicate with our node. Try after sometime',
                  icon: 'error',
                  showCancelButton: false,
                  confirmButtonText: 'Done'
                }).then((result) => {
                  if (result.value) {
                    this.registerForm.reset();
                    this.router.navigateByUrl('/register');
                  }
                })
              }
              else {
                Swal.fire({
                  title: 'Failed',
                  text: JSON.parse(data.error).error.what,
                  icon: 'error',
                  showCancelButton: false,
                  confirmButtonText: 'Done'
                }).then((result) => {
                  if (result.value) {
                    this.registerForm.reset();
                    this.router.navigateByUrl('/register');
                  }
                })
              }

            }
          }
        );
    }

  }

  doCopyPublicKey() {
    this.isCopyPublicKey = true;
    copy(this.publicKey);
    Swal.fire({
      title: 'Copied',
      text: this.publicKey,
      icon: 'success',
      timer: 1000,
      showConfirmButton: false
    })
  }

  doCopyPrivateKey() {
    this.isCopyPrivateKey = true;
    copy(this.privateKey);
    Swal.fire({
      title: 'Copied',
      text: this.privateKey,
      icon: 'success',
      timer: 1000,
      showConfirmButton: false
    })

  }

}
