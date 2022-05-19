import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor() { }


  public encryptData(data) {

    try {
      return CryptoJS.AES.encrypt(data.key, data.aName).toString();
    } catch (e) {
      console.log(e);
    }
  }

  public decryptData(data) {

    try {
      const bytes = CryptoJS.AES.decrypt(data.key, data.aName);
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
    } catch (e) {
      console.log(e);
    }
  }


public encryptWithCryptoJS(data): string {
  const key = CryptoJS.enc.Utf8.parse(data.aName);
  const iv1 = CryptoJS.enc.Utf8.parse("hf8685nfhfhjs9h8");
  const encrypted = CryptoJS.AES.encrypt(data.key, key, {
      keySize: 16,
      iv: iv1,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
  });

  return encrypted + "";
}

public decryptionWithCryptoJS(data): string {
  const key = CryptoJS.enc.Utf8.parse(data.aName);
  const iv1 = CryptoJS.enc.Utf8.parse("hf8685nfhfhjs9h8");
  const plainText = CryptoJS.AES.decrypt(data.key, key, {
      keySize: 16,
      iv: iv1,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
  });

  return plainText.toString(CryptoJS.enc.Utf8);
}


}
