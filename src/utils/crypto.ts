import * as CryptoJS from 'crypto-js';

export const encryPassword = (psw: string) => {
  if (!psw) {
    return '';
  }
  // return sha256(psw).toString();
  return CryptoJS.SHA256(psw).toString();
};
