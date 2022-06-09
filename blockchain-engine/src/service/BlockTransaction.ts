import { Block } from "../kernel/Block";
import { Cryptomodel } from "../kernel/Cryptomodel";
import { Transaction } from "../kernel/Transaction";

/*
    This class is part of the utility prvided by the BlockchainManager.
    It's purpose is to join a transaction object with a timestamp of a block.
    Also, the key values are hashed to md5.
*/

export class BlockTransaction extends Transaction {
    constructor(
        amount: number,
        payer: string,
        payee: string,
        public ts: number) {
        super(amount, payer, payee);
        // here we dont want to expose the public keys just for sake of less verbose outputs 
        // so we're hashing the keys to MD5 so they're easier to read.
        this.payee = Cryptomodel.md5Digest(this.payee);
        this.payer = Cryptomodel.md5Digest(this.payer);
    }
    public static fromBlock(b: Block): BlockTransaction {
        return new BlockTransaction(b.transaction.amount, b.transaction.payer, b.transaction.payee, b.ts);
    }
    
}