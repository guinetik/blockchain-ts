import { Wallet } from "../kernel/Wallet";
import { CrudService } from "./CrudService";
import { BlockchainService } from "./BlockchainService";
import { Cryptomodel } from "../kernel/Cryptomodel";
import { BlockTransaction } from "./BlockTransaction";
import { Block } from "../kernel/Block";

export class User {
    public id: string;
    constructor(public username: string, private wallet: Wallet<BlockchainService>) {
        this.id = Cryptomodel.md5Digest(wallet.publicKey);
    }
    public transferFunds(amount: number, receiverPublicKey: string): string {
        return this.wallet.sendMoney(amount, receiverPublicKey);
    }
    public get publicKey() {
        return this.wallet.publicKey;
    }
}

export class UserService implements CrudService<User, string> {
    private users: User[] = [];

    create(entity: User): string {
        if (this.findByUsername(entity.username)) {
            throw new Error("Username already exists");
        }
        this.users.push(entity);
        return entity.id;
    }

    read(id: string): User | undefined {
        return this.users.find(user => user.id === id);
    }

    update(entity: User): User {
        const u = this.read(entity.id);
        if (u) {
            this.delete(u.id);
            this.create(entity);
            return entity;
        } else {
            throw new Error("Username not found");
        }
    }

    delete(id: string): void {
        this.users = this.users.filter(user => user.id != id);
    }

    findByUsername(username: String): User | undefined {
        return this.users.find(user => user.username === username);
    }

    mapTransactions(transactions: BlockTransaction[]): BlockTransaction[] {
        //console.log(this.users);
        return transactions.map((b: BlockTransaction, i: number): BlockTransaction => {
            const payee: User | undefined = this.read(b.payee);
            const payer: User | undefined = this.read(b.payer);
            //console.log("payee:", b.payee, payee?.id);
            b.payee = payee ? payee.username : "unknown";
            b.payer = payer ? payer.username : "unknown"
            return b;
        });
    }
}