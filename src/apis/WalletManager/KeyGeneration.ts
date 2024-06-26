import {
    deriveHdPrivateNodeFromSeed,
    deriveHdPath,
    secp256k1,
    encodeCashAddress,
} from '@bitauth/libauth';
import { hash160 } from '@cashscript/utils';
import * as bip39 from "bip39";

export default function KeyGeneration() {
    return {
        generateMnemonic,
        generateKeys
    }

    async function generateMnemonic() : Promise<string> {
        const mnemonic = bip39.generateMnemonic();
        return mnemonic;
    };

    async function generateKeys(mnemonic : string, passphrase : string, keyNumber : number) {
        const seed = await bip39.mnemonicToSeed(mnemonic, passphrase);
        const rootNode = deriveHdPrivateNodeFromSeed(seed, true);
        const baseDerivationPath = `m/44'/145'/${keyNumber}'/0`;
        // const baseDerivationPathChange = "m/44'/145'/0'/1";
        // const changeNode = deriveHdPath(rootNode, `${baseDerivationPathChange}/${changeIndex}`);

        const aliceNode = deriveHdPath(rootNode, `${baseDerivationPath}/0`);

        if (typeof aliceNode === 'string') throw new Error();
        const alicePub  = secp256k1.derivePublicKeyCompressed(aliceNode.privateKey);
        const alicePriv = aliceNode.privateKey;
        if (typeof alicePub === 'string') {
            console.log("alicePub should not be a string.")
            return null;
        }
        const alicePkh = hash160(alicePub);
        console.log(alicePub);
        console.log(alicePriv);
        const aliceAddress = encodeCashAddress('bchtest', 'p2pkh', alicePkh);

        // const changePub = secp256k1.derivePublicKeyCompressed(changeNode.privateKey);
        // const changePriv = changeNode.privateKey;
        // const changePkh = hash160(changePub);
        // const changeAddress = encodeCashAddress('bchtest', 'p2pkh', changePkh);
        return { alicePub, alicePriv, aliceAddress }
    };
}
