// import ElectrumService from "./ElectrumServer/ElectrumServer";

// export interface TransactionStub {
//     txid: string;
//     hex: string;
//   }

// export default function TransactionManager() {
//     return {
//         sendTransaction
//     }
//     async function sendTransaction( tx: TransactionStub, wallet: WalletEntity ): Promise<boolean> {
//         const { txid: tx_hash, hex: tx_hex } = tx;
        
//         const Electrum = ElectrumService();
//         const result = await Electrum.broadcastTransaction(tx_hex);
//         const isSuccess = result === tx_hash;
//       }
    
// }