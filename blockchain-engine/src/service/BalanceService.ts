/**
 * A simple class to manage balance across accounts. 
 * We take a proactive approach to managing account balances because calculating that in the blockchain in real time
 * requires a lot of computations. So we treat this service as a caching mechanism for accessing balances without
 * the need to traverse the whole blockchain.
 */
export class BalanceService {
    private balances: Map<string, number>;
    private static instance:BalanceService;
    /**
     * Gets the balance service instance
     * @returns the singleton instance
     */
    public static getInstance() {
        if(BalanceService.instance ==  null) BalanceService.instance = new BalanceService();
        return BalanceService.instance;
    }
    /**
     * Service Constructor
     */
    private constructor() {
        this.balances = new Map();
    }
    /**
     * Creates a new balance registry for a wallet
     * @param id the wallet's public key in MD5 format;
     * @param initialDeposit the initial value for the wallet
     */
    public create(id:string, initialDeposit:number):void {
        this.balances.set(id, initialDeposit);
    }

    /**
     * Returns a wallet's ballance
     * @param id the wallet's public key in MD5 format
     * @returns the current wallet's balance
     */
    public get(id:string):number {
        return this.balances.get(id) || 0;
    }

    /**
     * Increments a wallet's ballance
     * @param id the wallet's public key in MD5 format
     * @param amount the amount to add to the balance
     * @returns the new balance of the wallet
     */
    public add(id:string, amount:number):number {
        console.log("adding %d to %s", amount, id);
        const sum = this.get(id) + amount;
        this.balances.set(id, sum);
        return sum;
    }

    /**
     * Decrements a wallet's ballance
     * @param id the wallet's public key in MD5 format
     * @param amount the amount to subtract from the balance
     * @returns the new balance of the wallet
     */
    public subtract(id:string, amount:number):number {
        console.log("subtracting %d to %s", amount, id);
        const diff = this.get(id) - amount;
        this.balances.set(id, diff);
        return diff;
    }

    public canTransfer(id:string, amount:number):boolean {
        console.log(this.balances);
        const diff = this.get(id) - amount;
        return diff > 0;
    }
}