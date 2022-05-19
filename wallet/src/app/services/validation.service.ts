// Validation Service
// @author Linto Thomas (linto@netobjex.com)
import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }
  static getValidatorErrorMessage(code: string) {
    const config = {
      required: 'Required',
      invalidEmailAddress: 'Invalid email address',
      invalidAccountName: 'Please enter a valid account name. Account name can contain a-z & 1-5, should be 12 characters in legth',
      invalidPrivateKey: 'Please enter a valid private key',
      invalidPassword: 'Invalid password. Password must be at least 6 characters long, and contain a number.',
      invalidCreditCard: 'Invalid credit card. Please enter valid card number.',
      invalidText: 'Invalid input. Please enter valid characters.',
      invalidNumber: 'Invalid input. Please enter valid number.',
      invalidExpiry: 'Invalid input. Please enter a valid expiry date in YYY/MM format.',
      invalidPhone: 'Invalid phone number',
      invalidUrl: 'Invalid url'
    };
    return config[code];
  }

  static emailValidator(control: AbstractControl) {
    // RFC 2822 compliant regex
    // tslint:disable-next-line
    if (
      control.value.match(
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
      )
    ) {
      return null;
    } else {
      return { invalidEmailAddress: true };
    }
  }

  static passwordValidator(control: AbstractControl) {
    // {6,100}           - Assert password is between 6 and 100 characters
    // (?=.*[0-9])       - Assert a string has at least one number
    // (?!.*\s)          - Spaces are not allowed
    // tslint:disable-next-line
    if (control.value.match(/^(?=.*\d)(?=.*[a-zA-Z!@#$%^&*])(?!.*\s).{6,100}$/)) {
      return null;
    } else {
      return { invalidPassword: true };
    }
  }

  static phoneValidator(control: AbstractControl) {
    // {6,100}           - Assert password is between 6 and 100 characters
    // (?=.*[0-9])       - Assert a string has at least one number
    // (?!.*\s)          - Spaces are not allowed
    // tslint:disable-next-line
    if (control.value.match(/^(\+?(\d{1}|\d{2}|\d{3})[- ]?)?\d{3}[- ]?\d{3}[- ]?\d{4}$/)) {
      return null;
    } else {
      return { invalidPhone: true };
    }
  }

  static creditCardValidator(control: AbstractControl) {
    // Visa, MasterCard, American Express, Diners Club, Discover, JCB
    // tslint:disable-next-line
    if (
      control.value.match(
        /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/
      )
    ) {
      return null;
    } else {
      return { invalidCreditCard: true };
    }
  }

  static textOnlyValidator(control: AbstractControl) {
    // A-Z, a-z - Text only validation
    // tslint:disable-next-line
    if (control.value.match(/^(?:[ A-Za-z]*)$/)) {
      return null;
    } else {
      return { invalidText: true };
    }
  }
  static urlValidator(control: AbstractControl) {
    // A-Z, a-z - Text only validation
    // tslint:disable-next-line
    if (
      control.value.match(
        /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
      )
    ) {
      return null;
    } else {
      return { invalidUrl: true };
    }
  }
  static textValidator(control: AbstractControl) {
    // A-Z, a-z - Text only validation
    // tslint:disable-next-line
    if (control.value.match(/^(?:[ A-Za-z!#$%&'*+/=?^_`{|}~-]*)$/)) {
      return null;
    } else {
      return { invalidText: true };
    }
  }

  static accountNameValidator(control: AbstractControl) {
    // A-Z, a-z - Text only validation
    // tslint:disable-next-line
    if (control.value.match(/^(?:[a-z1-5]{12})$/)) {
      return null;
    } else {
      return { invalidAccountName: true };
    }
  }

  static privateKeyValidator(control: AbstractControl) {
    // A-Z, a-z - Text only validation
    // tslint:disable-next-line
    if (control.value.match(/^5(?:[A-Za-z0-9]{50})$/)) {
      return null;
    } else {
      return { invalidPrivateKey: true };
    }
  }

  static numberOnlyValidator(control: AbstractControl) {
    // 0-9 - Number only validation
    // tslint:disable-next-line
    if (control.value.match(/^(?:[0.0-9.9]*)$/)) {
      return null;
    } else {
      return { invalidNumber: true };
    }
  }

  static expiryDateValidationMMYYYY(control: AbstractControl) {
    // MM-YYYY Validator
    // tslint:disable-next-line
    if (control.value.match(/^(?:((2009)|(20[1-2][0-9]))\/((0[1-9])|(1[0-2])))$/)) {
      return null;
    } else {
      return { invalidExpiry: true };
    }
  }
}
