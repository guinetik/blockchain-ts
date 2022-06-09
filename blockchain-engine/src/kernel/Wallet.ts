import * as crypto from 'crypto';
import { BlockchainService } from '../service/BlockchainService';
import { Chain } from './Chain';
import { LedgerController } from './LedgerController';
import { Transaction } from './Transaction';
//
/* 
  A Wallet is a wrapper for a RSA key-pair. 
  A wallet is also weakly bound to a LedgerController, which is responsible for the actual transfer of funds.
  This is done to decouple the kernel package from the service package so a Wallet can have more than one kind of controller.
  In this project, BlockchainService is the main controller used.
*/
export class Wallet<T extends LedgerController> {
    public publicKey: string;
    public privateKey: string;
    private managerKey: string = "";
  
    constructor(private controller:LedgerController, key?:string) {
      const keypair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      //
      this.privateKey = keypair.privateKey;
      this.publicKey = keypair.publicKey;
      if( typeof(key) !== 'undefined' ) {
        this.managerKey = key;
      } else {
        this.managerKey = this.privateKey;
      }
    }
  
    public sendMoney(amount: number, payeePublicKey: string):string {
      const transaction = new Transaction(amount, this.publicKey, payeePublicKey);
      //
      const sign = crypto.createSign('SHA256');
      sign.update(transaction.toString()).end();
      //
      const signature = sign.sign(this.privateKey);
      return this.controller.addTransaction(this.managerKey, transaction, this.publicKey, signature);
    }
  }
  