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
    const rootNode = deriveHdPrivateNodeFromSeed(seed, true);
    const baseDerivationPath = "m/44'/145'/0'/0";

    // Derive Alice's private key, public key, public key hash and address
    const aliceNode = deriveHdPath(rootNode, `${baseDerivationPath}/0`);
    if (typeof aliceNode === 'string') throw new Error();
    const alicePub = secp256k1.derivePublicKeyCompressed(aliceNode.privateKey);
    const alicePriv = aliceNode.privateKey;
    const alicePkh = hash160(alicePub);
    const aliceAddress = encodeCashAddress('bchtest', 'p2pkh', alicePkh);
    return { aliceAddress, alicePriv }
};

export { generateMnemonic, generateKeys };