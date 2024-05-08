import {
    deriveHdPrivateNodeFromSeed,
    deriveHdPath,
    secp256k1,
    encodeCashAddress,
} from '@bitauth/libauth';
import { hash160 } from '@cashscript/utils';
import * as bip39 from "bip39";
import * as bitcoin from 'bitcoinjs-lib';

const generateMnemonic = () => {
    const mnemonic = bip39.generateMnemonic();
    return mnemonic;
};

const generateKeys = async (mnemonic, passphrase, coin) => {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const rootNode = deriveHdPrivateNodeFromSeed(seed);
    const baseDerivationPath = "m/44'/145'/0'/0";

    const aliceNode = deriveHdPath(rootNode, `${baseDerivationPath}/0`);
    if (typeof aliceNode === 'string') throw new Error();
    const publicKey = secp256k1.derivePublicKeyCompressed(aliceNode.privateKey) as Uint8Array;
    const privateKey = aliceNode.privateKey;
    const encodedPublicKey = hash160(publicKey);
    const address = encodeCashAddress({
        payload: encodedPublicKey,
        prefix: 'bchtest',
        type: 'p2pkh',
        throwErrors: true
    });
    return { address, encodedPublicKey, privateKey }
};

export { generateMnemonic, generateKeys };