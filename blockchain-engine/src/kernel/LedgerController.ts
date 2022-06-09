import { Transaction } from "./Transaction";

export interface LedgerController {
    addTransaction(managerKey: string, t: Transaction, publicKey: string, signature: Buffer): string
}