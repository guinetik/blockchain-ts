import { BlockchainService } from "./service/BlockchainService";
import { Chain } from "./kernel/Chain";
import { Cryptomodel } from "./kernel/Cryptomodel";
import { Transaction } from "./kernel/Transaction";
import { TransactionStatus } from "./kernel/TransactionStatus";
import { User, UserService } from "./service/UserService";
import { BalanceService } from "./service/BalanceService";
/* //
function test(){
    const manager = BlockchainService.init(1000);
    const gui = manager.createWallet(100);
    console.log("\n");
    console.log("Gui's public key: %s", Cryptomodel.md5Digest(gui.publicKey));
    console.log("\nALL TRANSACTIONS\n");
    console.log(manager.getAllTransactions());
}
//
function run() {
    const manager = BlockchainService.init(1000);
    const gui = manager.createWallet(100);
    const alice = manager.createWallet(0);
    const bob = manager.createWallet(1);
    //
    console.log("\n");
    console.log("Gui's public key: %s", Cryptomodel.md5Digest(gui.publicKey));
    console.log("Alice's public key: %s", Cryptomodel.md5Digest(alice.publicKey));
    console.log("Bob's public key: %s", Cryptomodel.md5Digest(bob.publicKey));
    console.log("\n");
    //
    gui.sendMoney(10, alice.publicKey);
    gui.sendMoney(25, bob.publicKey);
    bob.sendMoney(10, alice.publicKey);
    //
    console.log("\nGUI'S TRANSACTIONS\n");
    const transactionsGui = manager.getWalletTransactions(gui);
    console.log(transactionsGui);
    console.log("\nALL TRANSACTIONS\n");
    console.log(manager.getAllTransactions());
}
 */
function app() {
    // initialize services
    const userService: UserService = new UserService();
    const managerPrivateKey:string = BlockchainService.init(1000);
    const manager = BlockchainService.getInstance();
    const balances = BalanceService.getInstance();
    //
    // creating a master user and binding the genesis wallet to them
    const master:User = new User("master", manager.getWallet(managerPrivateKey));
    const masterId = userService.create(master);
    console.log("master's public key: %s - %s", master.id, masterId);
    //
    // create some users and define their wallets initial deposit
    const gui: User = new User("guinetik", manager.createWallet(100));
    const alice: User = new User("alice", manager.createWallet(0));
    const chad: User = new User("chad", manager.createWallet(0));
    const janice: User = new User("janice", manager.createWallet(250));
    const phillip: User = new User("phillip", manager.createWallet(500));
    const beatrix: User = new User("beatrix", manager.createWallet(10));
    //
    // adding users to the user service
    const guiId = userService.create(gui);
    const aliceId = userService.create(alice);
    const chadId = userService.create(chad);
    const janiceId = userService.create(janice);
    const phillipId = userService.create(phillip);
    const beatrixId = userService.create(beatrix);
    //
    //
    console.log("\n");
    console.log("Gui's public key: %s - %s", gui.id, guiId);
    console.log("Alice's public key: %s - %s", alice.id, aliceId);
    console.log("\n");
    // transfer some funds between users
    gui.transferFunds(10, alice.publicKey);
    gui.transferFunds(25, chad.publicKey);
    gui.transferFunds(10, chad.publicKey);
    try {
        gui.transferFunds(100, beatrix.publicKey);
    } catch(err) {
        console.log(err);
    }
    //
    janice.transferFunds(10, alice.publicKey);
    janice.transferFunds(50, chad.publicKey);
    //
    //
    console.log("Gui's balance:", balances.get(gui.id), balances.get(gui.id) == 55);
    console.log("Chads's balance:", balances.get(chad.id));
    //
    console.log("\nALL TRANSACTIONS\n");
    console.log(userService.mapTransactions(manager.getAllTransactions()));
}
app();