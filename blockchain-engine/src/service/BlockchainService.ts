import { ILinkedList } from "../utils/ILinkedList";
import { Block } from "../kernel/Block";
import { BlockTransaction } from "./BlockTransaction";
import { Chain, TransactionStatusListener } from "../kernel/Chain";
import { Transaction } from "../kernel/Transaction";
import { TransactionStatus } from "../kernel/TransactionStatus";
import { Wallet } from "../kernel/Wallet";
import { stat } from "fs";
import { LedgerController } from "../kernel/LedgerController";
import { Cryptomodel } from "../kernel/Cryptomodel";
import { BalanceService } from "./BalanceService";
/**
 * Here we take full advantage of the nice blockchain 
 * implementation created by fireship.io by making it a managed service.
 * This class manages the chain creation, initial coin offering and 
 * creates a master wallet from which it transfers funds for newly created wallets.
 * This way, all new wallet's funds must come from the master wallet.
 * The public methods that deal with funds and writing to the chain require the managerKey parameter,
 * which only this class can know. This way, only this class can write to the block chain.
 * Also, we create a map of transactions to keep track of the status of the transaction.
 */
export class BlockchainService implements LedgerController {
    protected master: Wallet<BlockchainService>;
    private balances: BalanceService;
    private transactions: Map<string, TransactionStatus>;
    private static instance: BlockchainService;

    /**
     * Initializes a new blockchain service
     * @param ico - The initial coin offering. How many coins this chain will initially create
     * @returns - MD5 hash of the master wallet's private key. This is the only way to get access to the master wallet.
     */
    public static init(ico: number): string {
        BlockchainService.instance = new BlockchainService(ico);
        return Cryptomodel.md5Digest(BlockchainService.instance.master.privateKey);
    }

    /**
     * Main point of entry to get the blockchain service. make sure to call init first
     * @returns the instance of the blockchain service
     */
    public static getInstance(): BlockchainService {
        if (this.instance == null) throw new Error("manager not initialized");
        return this.instance;
    }

    /**
     * Gets the master wallet used on the genesis block.
     * @param servicePrivateKey - MD5 hash of this service's wallet private key
     * @returns the master wallet
     */
    public getWallet(servicePrivateKey: string): Wallet<BlockchainService> {
        if (Cryptomodel.md5Digest(BlockchainService.instance.master.privateKey) === servicePrivateKey) {
            return this.master;
        } else {
            throw new Error("invalid private key");
        }
    }

    private constructor(ico: number) {
        console.log("creating transactions map...");
        this.transactions = new Map();
        //
        console.log("creating master wallet...");
        this.master = new Wallet(this);
        //
        console.log("initializing chain database...");
        Chain.init(ico, this.master.publicKey);
        //
        console.log("initializing balance service...");
        this.balances = BalanceService.getInstance();
        this.balances.create(Cryptomodel.md5Digest(this.master.publicKey), ico);
    }

    /**
     * Attemps to commit a transaction to the blockchain.
     * Validates payer balance before commiting. 
     * Listens for the proof of work to update the transaction and then updates the balance of payer and payee.
     * @param managerKey RSA key for this service's wallet
     * @param t the transaction to add
     * @param senderPublicKey the public key of the sender
     * @param signature the transaction's signature, signed with the sender's public key
     * @returns the transaction's hash
     */
    public addTransaction(managerKey: string, t: Transaction, senderPublicKey: string, signature: Buffer): string {
        this.validateManagerKey(managerKey);
        const payerMD5 = Cryptomodel.md5Digest(t.payer);
        const payeeMD5 = Cryptomodel.md5Digest(t.payee);
        if (this.balances.canTransfer(payerMD5, t.amount)) {
            this.updateTransaction(managerKey, t.hash, TransactionStatus.EMITTED);
            const thus = this;
            const transactionListener: TransactionStatusListener = {
                update(transactionHash: string, status: TransactionStatus): void {
                    console.log("updating transaction %s: %s", transactionHash, status);
                    thus.updateTransaction(managerKey, transactionHash, status);
                    if(status === TransactionStatus.COMMITTED) {
                        thus.balances.add(payeeMD5, t.amount);
                        thus.balances.subtract(payerMD5, t.amount);
                    }
                }
            };
            Chain.getInstance().addBlock(t, senderPublicKey, signature, transactionListener);
            return t.hash;
        } else {
            throw new Error("Not enough balance for this transfer");
        }
    }

    /**
     * Updates a transaction status 
     * @param managerKey RSA key for this service's wallet
     * @param hash Transaction's hash
     * @param status new transaction status
     */
    public updateTransaction(managerKey: string, hash: string, status: TransactionStatus): void {
        this.validateManagerKey(managerKey);
        this.transactions.set(hash, status);
    }

    /**
     * Creates a new wallet
     * @param amountToDeposit Initial wallet's deposit
     * @returns The wallet object
     */
    public createWallet(amountToDeposit: number): Wallet<BlockchainService> {
        console.log("creating new wallet...");
        const w = new Wallet(this, this.master.privateKey);
        if (amountToDeposit > 0) {
            console.log("transfering initial wallet amount...");
            this.master.sendMoney(amountToDeposit, w.publicKey);
        }
        this.balances.create(Cryptomodel.md5Digest(w.publicKey), amountToDeposit);
        return w;
    }

    /**
     * Validates a master private key
     * @param managerKey master wallet's private key in RSA format
     */
    private validateManagerKey(managerKey: string) {
        if (managerKey !== this.master.privateKey) throw new Error("Invalid manager signature");
    }

    /**
     * Returns a transaction's status
     * @param t transaction's hash
     * @returns status of the transaction
     */
    public getTransactionStatus(t: string): TransactionStatus {
        return this.transactions.get(t) as TransactionStatus;
    }

    /**
     * Returns all transactions received for a wallet
     * @param w An user's wallet
     * @returns An array of all transactions received
     */
    public getTransactionsReceived(w: Wallet<BlockchainService>): BlockTransaction[] {
        return this.getTransactions((b: Block) => b.transaction.payee === w.publicKey)
    }

    /**
     * Returns all transactions paid in a wallet
     * @param w An user's wallet
     * @returns An array of all transactions paid
     */
    public getTransactionsPaid(w: Wallet<BlockchainService>): BlockTransaction[] {
        return this.getTransactions((b: Block) => b.transaction.payer === w.publicKey)
    }

    /**
     * Returns all transactions made in a wallet
     * @param w An user's wallet
     * @returns An array of all transactions for the wallet
     */
    public getWalletTransactions(w: Wallet<BlockchainService>): BlockTransaction[] {
        return this.getTransactions((b: Block) => b.transaction.payer === w.publicKey || b.transaction.payee === w.publicKey)
    }

    /**
     * Returns all transactions that fit a criteria expressed in a comparator function
     * @param comparator a comparator function that returns a boolean value
     * @returns An array of all transations that match the comparator function
     */
    public getTransactions(comparator: (data: Block) => boolean): BlockTransaction[] {
        // TODO: `this can use some optimizing
        const byWallet: BlockTransaction[] = [];
        const data: ILinkedList<Block> = Chain.getData(this.master.publicKey);
        const nodes = data.searchAll(comparator);
        if (nodes) {
            nodes.forEach((node) => byWallet.push(BlockTransaction.fromBlock(node.data)));
        }
        return byWallet;
    }

    /**
     * Returns a list of all transactions
     * @returns All transactions on the blockchain
     */
    public getAllTransactions(): BlockTransaction[] {
        const data: ILinkedList<Block> = Chain.getData(this.master.publicKey);
        const result: BlockTransaction[] = [];
        data.traverse().forEach(block => result.push(BlockTransaction.fromBlock(block)));
        return result;
    }
}