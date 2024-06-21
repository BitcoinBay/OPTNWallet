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

    async function generateKeys(mnemonic : string, passphrase : string, keyNumber : number, isMainnet : boolean) {
        const seed = await bip39.mnemonicToSeed(mnemonic, passphrase);
        const rootNode = deriveHdPrivateNodeFromSeed(seed, true);
        const coin_type = isMainnet ? 145 : 1;
        const baseDerivationPath = `m/44'/${coin_type}'/${keyNumber}'/0`;

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
        const addressPrefix = isMainnet ? 'bitcoincash' : 'bchtest';
        const aliceAddress = encodeCashAddress(addressPrefix, 'p2pkh', alicePkh);

        return { alicePub, alicePriv, aliceAddress };
    };
}
