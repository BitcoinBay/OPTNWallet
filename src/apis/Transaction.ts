import {
    sha256,
    encodeTransaction,
    generateTransaction,
    hexToBin,
    swapEndianness,
    cashAddressToLockingBytecode,
    base58AddressToLockingBytecode,
    importAuthenticationTemplate,
    authenticationTemplateP2pkhNonHd,
    authenticationTemplateToCompilerBCH,
  } from "@bitauth/libauth";
import { binToHex } from '../utils/hex'
import { validateInvoiceString } from '../utils/invoice'
import ElectrumService from "./ElectrumServer/ElectrumServer";

export default function Transactions() {
    return {
        buildTransaction
    }
    function addressToLockingByteCode(addr) {
        const { isBase58Address, address } = validateInvoiceString(addr);
        const lockingBytecode = isBase58Address
          ? base58AddressToLockingBytecode(address)
          : cashAddressToLockingBytecode(address);
    
        if (typeof lockingBytecode === "string") {
          throw new Error(lockingBytecode);
        }
    
        return lockingBytecode.bytecode;
      }
    async function buildTransaction(input) {
        const template = importAuthenticationTemplate(
            authenticationTemplateP2pkhNonHd
        );
        console.log('poggers')
        const compiler = authenticationTemplateToCompilerBCH(template);
        const value = 100
        const vout = [{
            lockingBytecode: addressToLockingByteCode("bchtest:pdayzgu6vnpwsgkjpzhp7d8fmr9e3ugn7w6umre4w9tv6862l0y76sxcklaq8"),
            valueSatoshis: BigInt(value),
        }];
        console.log('testing123')
        console.log('this is my input',input)
        const transactionInput = [{
            outpointTransactionHash: hexToBin(input.tx_hash),
            outpointIndex: input.tx_pos,
            sequenceNumber: 0,
            unlockingBytecode: {
                compiler,
                script: "unlock",
                valueSatoshis: BigInt(input.value),
                data: {
                    keys: {
                        privateKeys: {
                            key: [218, 197, 243, 44, 117, 92, 8, 79, 203, 195, 39, 238, 97, 52, 29, 37, 16, 112, 41, 236, 4, 71, 129, 113, 221, 24, 23, 180, 12, 74, 5, 96],
                        },
                    },
            },
            },
        }];
        console.log(transactionInput)
        console.log('testing1234')
        try {
            const generatedTx = generateTransaction({
                inputs: transactionInput,
                outputs: vout,
                locktime: 0,
                version: 2,
            });
            console.log(generatedTx)
            const tx_raw = encodeTransaction(generatedTx.transaction);
            console.log(tx_raw)
            const tx_hex = binToHex(tx_raw);
            console.log(tx_raw)
            const tx_hash = swapEndianness(binToHex(sha256.hash(sha256.hash(tx_raw))));

            const Electrum = ElectrumService();
            const result = await Electrum.broadcastTransaction(tx_hex);
            console.log('i am testing')
            const isSuccess = result === tx_hash;
            console.log(tx_hash)
            console.log(isSuccess)
        } catch (error) {
            console.error("Failed to generate transaction:", error);
        }
    };
}