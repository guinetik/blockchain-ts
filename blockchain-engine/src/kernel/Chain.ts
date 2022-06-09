import { Block } from "./Block";
import { Transaction } from "./Transaction";
import * as crypto from 'crypto';
import { BlockchainService } from "../service/BlockchainService";
import { TransactionStatus } from "./TransactionStatus";
import { ILinkedList } from "../utils/ILinkedList";
import { LinkedList } from "../utils/LinkedList";
import { Cryptomodel } from "./Cryptomodel";

/* 
  A chain is a linked-list database of transactions that have been permanently commited to the database.
  "It works like a git-repo that can never be rebased"
  Each new block is linked to the previous block in the chain. 
  The creation of the block goes through a strict set of cripto rules.
  Each user or Wallet has a public-key for receiving money and a unique private key to spending money.
  But before you can spend money, you'll need to prove to be owner of a public key that has received a transaction in the past.
  This makes possible to validate the chain of ownership without the need to expose the private keys.
*/
export class Chain {
  private data: ILinkedList<Block>;
  private genesis: Block;
  // Singleton instance
  private static instance: Chain;

  public static getInstance() {
    if (Chain.instance == null) throw new Error("chain has not been initialized");
    return Chain.instance;
  }

  /* 
    @param ico: The initial number of coins to be minted
    @param managerKey: The signature key for BlockchainManager 
  */
  public static init(ico: number, managerKey: string) {
    Chain.instance = new Chain(ico, managerKey);
  }

  public static getData(managerKey: string): ILinkedList<Block> {
    if (managerKey !== Chain.instance.genesis.transaction.payee) throw new Error("Invalid manager signature");
    return Chain.instance.data;
  }

  private constructor(ico: number, managerKey: string) {
    console.log("creating genesis block");
    this.data = new LinkedList();
    this.genesis = new Block('', new Transaction(ico, 'genesis', managerKey));
    this.data.insertInBegin(this.genesis);
  }

  // Most recent block
  get lastBlock(): Block {
    return this.data.getLast().data;
  }

  // Proof of work system
  /* 
      In order to avoid double-spending, each transaction needs to be mined by solving a computer problem that is hard to solve, but easy to verify.
      The first node of the system to complete this problem gets to transmit the transaction to the block-chain.
  */
  mine(nonce: number) {
    let solution = 1;
    console.log('⛏️  mining...');
    while (true) {
      const attempt = Cryptomodel.md5Digest((nonce + solution).toString());
      if (attempt.substr(0, 4) === '0000') {
        console.log(`Solved: ${solution}`);
        return solution;
      }
      solution += 1;
    }
  }

  // Add a new block to the chain if valid signature & proof of work is complete
  addBlock(t: Transaction, senderPublicKey: string, signature: Buffer, transactionListener?: TransactionStatusListener) {
    try {
      const verify = crypto.createVerify('SHA256');
      verify.update(t.toString());
      const isValid = verify.verify(senderPublicKey, signature);
      console.log("verifying sender's public key: ", isValid);
      //
      if (isValid) {
        const newBlock = new Block(this.lastBlock.hash, t);
        transactionListener?.update(t.hash, TransactionStatus.PROCESSING);
        //
        this.mine(newBlock.nonce);
        this.data.insertAtEnd(newBlock);
        //
        transactionListener?.update(t.hash, TransactionStatus.COMMITTED);
      } else {
        transactionListener?.update(t.hash, TransactionStatus.INVALID);
      }
    } catch (err: any) {
      console.log(err);
      transactionListener?.update(t.hash, TransactionStatus.ERROR);
    }
  }
}
export interface TransactionStatusListener {
  update(transactionHash: string, status: TransactionStatus): void;
}