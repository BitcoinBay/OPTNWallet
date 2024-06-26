import { ElectrumNetworkProvider, TransactionBuilder, Network, SignatureTemplate } from 'cashscript';
import { UTXOs } from '../types';
import { Utxo, Contract } from 'cashscript';
import { hash160 } from '@cashscript/utils';
import UTXOManager from '../UTXOManager/UTXOManager';
import { Decimal } from 'decimal.js';
import DatabaseService from '../DatabaseManager/DatabaseService';
import { compileFile } from 'cashc';
const DUST_LIMIT = 546;

export default function TransactionBuilders2() {

    const provider = new ElectrumNetworkProvider('chipnet');
    const ManageUTXOs = UTXOManager();
    const dbService = DatabaseService();


    async function createTransaction(
        wallet_name: string,
        recipients: Array<{ address: string; amount: number }>,
        fee: number = DUST_LIMIT / 3,
    ): Promise<any> {
        const sendTotal = recipients
            .reduce((sum, cur) => sum.plus(cur.amount), new Decimal(0))
            .toNumber();
        const UTXO_inputs: UTXOs[] | null = await (await ManageUTXOs).fetchUTXOs(sendTotal, fee, "BCH", wallet_name);
        if (UTXO_inputs == null) {
            console.log('no utxo inputs fetched from wallet');
            return null;
        }
        
        const artifact = compileFile(new URL('IntrospectionCovenant.cash', import.meta.url));

        const convertedUTXOs: Utxo[] = UTXO_inputs.map(utxo => ({
            txid: utxo.tx_hash,
            vout: utxo.tx_pos,
            satoshis: BigInt(utxo.amount),
        }));

        const privateKeys: Uint8Array[] = UTXO_inputs.map(utxo => utxo.private_key);
        const transactionBuilder = new TransactionBuilder({ provider });

        const addressType = 'p2sh32';
        await dbService.ensureDatabaseStarted();
        const db = dbService.getDatabase();
        if (db == null) {
            return null;
        }
        console.log('converted utxos', convertedUTXOs);
        convertedUTXOs.forEach((utxo, index) => {
            const privateKey = privateKeys[index];
            console.log('private key:', privateKey);
            

            const getAllKeysQuery = db.prepare("SELECT * FROM keys;");
            console.log('All keys in the keys table:');
            while (getAllKeysQuery.step()) {
                const row = getAllKeysQuery.getAsObject();
                console.log('row', row);
            }
            getAllKeysQuery.free();

            const getIdQuery = db.prepare(
                "SELECT public_key FROM keys WHERE address = ?;"
            );
            getIdQuery.bind([UTXO_inputs[index].address]);

            let publicKeyArray: Uint8Array | null = null;
            while (getIdQuery.step()) {
                const row = getIdQuery.getAsObject();
                console.log('row', row);

                if (row.public_key) {
                    publicKeyArray = new Uint8Array(Object.values(row.public_key));
                    break;
                }
            }

            getIdQuery.free();
            console.log('public key:', publicKeyArray);
            if (!publicKeyArray) {
                console.error(`No public key found for private key at index ${index}`);
                return;
            }
            console.log('Checking private key, public inputs:', UTXO_inputs[index].private_key);

            const hash_public_key = hash160(publicKeyArray);
            const contract = new Contract(artifact, [hash_public_key], { provider : provider, addressType : addressType });
            console.log("utxo being inputted", utxo);
            console.log("contract", contract);
            transactionBuilder.addInput(utxo, contract.unlock.spend(publicKeyArray, new SignatureTemplate(privateKey)));
        });

        recipients.forEach(recipient => {
            transactionBuilder.addOutput({ to: recipient.address, amount: BigInt(recipient.amount) });
        });

        transactionBuilder.setMaxFee(BigInt(10000000));
        console.log(transactionBuilder);
        const txDetails = await transactionBuilder.send();
        console.log('Transaction details:', txDetails);

        const txHex = transactionBuilder.build();
        console.log('Transaction hex:', txHex);

        return txDetails;
    }

    return {
        createTransaction
    };
}
