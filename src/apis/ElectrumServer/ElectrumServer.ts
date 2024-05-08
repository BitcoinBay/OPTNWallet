import { ElectrumCluster, ElectrumClient, ElectrumTransport } from 'electrum-cash';
import { chipnetServers } from '../../utils/servers/ElectrumServers';

export enum Network {
    CHIPNET
}
//this is to declare the type of the electrum
let electrum: ElectrumClient | null = null;

const testServer = chipnetServers[0];

export default function ElectrumService() {
    //CONENCNNTING THE SERVER
    async function electrumConnect (server : string = testServer): Promise<void>{
        electrum = new ElectrumClient('OPTNWallet', '1.4.1', server, ElectrumTransport.WSS.Port, ElectrumTransport.WSS.Scheme);
        return electrum.connect();
    }
    //DISOCNET SERVER
    async function electrumDisconnect(status: boolean): Promise<boolean> {
        if (electrum !== null) {
            return electrum.disconnect(status);
        }
        return true;
    };

    //GTHE BALANCE
    async function getBalance(address : string) : Promise<any> {
        if (electrum !== null) {
            const params = [address, "include_tokens"]
            const { confirmed, unconfirmed } = await electrum.request(
                "blockchain.address.get_balance",
                ...params
            );
            return confirmed + unconfirmed
        }
    }
    async function getUTXOS(address : string) : Promise<any> {
        if (electrum !== null) {
            const UTXOs = await electrum.request(
                "blockchain.address.listunspent",
                address
            );
            return UTXOs;
    
        }
    }
    async function broadcastTransaction(tx_hex) {
        if (electrum !== null) {
            const tx_hash = await electrum.request(
            "blockchain.transaction.broadcast",
            tx_hex
            );
            return tx_hash;
        }
      }
    return { electrumConnect, electrumDisconnect, getBalance, getUTXOS, broadcastTransaction }

}
