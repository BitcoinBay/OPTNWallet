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
const DUST_LIMIT = 546

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
      async function buildTransaction(input, fee: number = DUST_LIMIT / 3, depth: number = 0) {
        const sendTotal = 10000;  // Satoshis to send
        let changeTotal = input.value - sendTotal - fee;
        
        // Import template and compiler
        const template = importAuthenticationTemplate(authenticationTemplateP2pkhNonHd);
        const compiler = authenticationTemplateToCompilerBCH(template);
    
        // Output to the recipient
        const vout = [{
            lockingBytecode: addressToLockingByteCode("bchtest:qznwqlqtzgqkxpt6gp92da2peprj3202s53trwdn7t"),
            valueSatoshis: BigInt(sendTotal),
        }];
    
        // Add change output if above the dust limit
        if (changeTotal >= DUST_LIMIT) {
            const changeAddress = "bchtest:qpaxvl9pxq6gycfkj8ppvgn9u8u8037fzg6sejgpp2";
            vout.push({
                lockingBytecode: addressToLockingByteCode(changeAddress),
                valueSatoshis: BigInt(changeTotal),
            });
        }
    
        // Set up the transaction input
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
    
        // Generate the transaction
        const generatedTx = generateTransaction({
            inputs: transactionInput,
            outputs: vout,
            locktime: 0,
            version: 2,
        });
        console.log('generated tx', generatedTx)
        const tx_raw = encodeTransaction(generatedTx.transaction);
        const tx_hex = binToHex(tx_raw);
        const tx_hash = swapEndianness(binToHex(sha256.hash(sha256.hash(tx_raw))));
        
        // Calculate the total fee including any non-reclaimed change
        // Calculate the total fee including any non-reclaimed change
        const feeTotal = changeTotal >= DUST_LIMIT ? fee : fee + changeTotal;
        const newFee = Math.max(tx_raw.length, feeTotal);  // Ensure new fee is at least as large as the calculated feeTotal

        // Check and avoid infinite loop by changing fee conditionally
        if (newFee > fee) {
            if (depth < 3) {  // Limit recursion depth to prevent infinite loops
                return buildTransaction(input, newFee, depth + 1);
            } else {
                console.error("Maximum depth reached without resolving fee issues.");
                return null;  // Or handle this scenario appropriately
            }
        }

        console.log(`Final Transaction Hash: ${tx_hash}`);
        console.log(`Final Transaction Hex: ${tx_hex}`);

        // If fee adjustments can't make it smaller, proceed with the transaction
        return {
            txid: tx_hash,
            hex: tx_hex,
        };

    };
    
    
};