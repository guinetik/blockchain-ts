import { Cryptomodel } from "./Cryptomodel";

export class Transaction extends Cryptomodel {
    constructor(
      public amount: number, 
      public payer: string, // public key
      public payee: string // public key
    ) {
      super();
    }
  }