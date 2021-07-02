import Web3 from 'web3';
import getWeb3 from "../getWeb3";

export default class Decall {

    constructor(props) {
        this.contract = props.contract;
        this.roomId = props.roomId;
        this.userId = props.userId;
        this.web3 = null;
       // this.init();
    }

    async init() {
        if (this.web3 === null) {
            this.web3 = await getWeb3();
            const accounts = await this.web3.eth.getAccounts();
            this.web3.eth.defaultAccount = accounts[0];
            console.log(this.web3.eth.defaultAccount);
        }
    }

    async join() {
        await this.init();
        const tx = await this.contract.methods.joinRoom(this.roomId,Web3.utils.utf8ToHex(this.userId)).send(
            {
                from: this.web3.eth.defaultAccount,
            },
        );
        await this._waitForBlock(tx);
        console.log("join done");
    }

    async putSDP(sdpString) {
        await this.init();
        const tx = await this.contract.methods.putSDP(
            this.roomId,
            this.userId,
            sdpString,
        ).send(
            {
                from: this.web3.eth.defaultAccount,
            }
        );
        await this._waitForBlock(tx);
    }

    async getSDP(targetUserId) {
        return await this.contract.methods.getSDP(
            this.roomId,
            targetUserId,
        ).call();
    }

    async getParticipants() {
        await this.init();
        var members = await this.contract.methods.getParticipants(this.roomId).call();
        
        //return members.map(Web3.utils.hexToUtf8).map(s=>s.replaceAll("\u0000",""));
        return members.map(Web3.utils.hexToUtf8);
    }

    async _waitForBlock(tx) {
        return await this.web3.eth.getTransactionReceipt(tx);
    }
}