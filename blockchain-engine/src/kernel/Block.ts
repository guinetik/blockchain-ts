import { Cryptomodel } from './Cryptomodel';
import { Transaction } from './Transaction';
/* 
    A block is a container for transactions.
    Each block is an element in a linked-list where each block has a reference to the previous block in the chain.
    The blockchain takes advantage of hashing functions, 
    which allow you to take a value from an arbitrary size and map it to a value of a fixed length.
    This value, called a hash digest cannot be reversed to reconstruct the original transaction value, 
    but it can be used to compare if two transactions are equal based on their hash values.
    This ensures that two blocks can be linked together without being manipulated.
*/
export class Block extends Cryptomodel {

    public nonce = Math.round(Math.random() * 999999999);
  
    constructor(
      public prevHash: string, 
      public transaction: Transaction, 
      public ts = Date.now()
    ) {
      super();
    }
  }