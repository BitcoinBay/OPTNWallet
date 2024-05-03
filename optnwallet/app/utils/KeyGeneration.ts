import { BIP32Factory } from 'bip32';
import {
    deriveHdPrivateNodeFromSeed,
    encodeHdPrivateKey,
    deriveHdPublicNode,
    encodeHdPublicKey,
  } from "@bitauth/libauth";

import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';

const network = bitcoin.networks.mainnet;

async function generateMnemonicWithSalt() {
    const length = 256;
    const mnemonic = await bip39.generateMnemonic(length);
    return mnemonic;
};

const generateMnemonic = async (salt) => {
    const result = await generateMnemonicWithSalt(); // Await the result
    return result;
};

const generateKeys = async (mnemonic, passphrase, coin) => {
    try {
        const seed = await bip39.mnemonicToSeed(mnemonic);
        console.log(coin);
        console.log(mnemonic);
        const root = deriveHdPrivateNodeFromSeed(seed);
        console.log('root', root)
        const coinType = {
            "BTC": "0",
            "LTC": "2",
            "BCH": "145"
        };
        const path = `m/44'/145'/0'/0/0`;
        const childNode = root.derivePath(`${path}/0`);
        console.log("node:", childNode);
        const publicKeyBuffer = childNode.publicKey;
        const address = bitcoin.payments.p2pkh({ pubkey: publicKeyBuffer, network }).address;
        const privateKey = childNode.toWIF();
        const publicKey = publicKeyBuffer.toString('hex');
        return {address, publicKey, privateKey }
    } catch (error) {
        console.log(error);
    };
};

const makeTransaction = async () => {
    try {

    } catch(error) {
        console.log(error);
    }
};


const BCHN_MAINNET = 'https://bchn.fullstack.cash/v5/'
import BCHJS from '@psf/bch-js';

const bchjs = new BCHJS({ restURL: BCHN_MAINNET })

const lang = 'english'

const testingNode = async () => {
    let outStr = "";
    let outObj = {};
    const mnemonic = "tonight wealth inch quantum hair leg steel industry weapon suggest picnic year group say brown scrub tattoo arrive ride slab wing glass cliff garage";
    outStr += 'BIP44 $BCH Wallet\n';
    console.log(`128 bit BIP39 Mnemonic: `, mnemonic);
    outStr += `\n128 bit BIP39 Mnemonic:\n${mnemonic}\n\n`;
    outObj.mnemonic = mnemonic;

    const rootSeed = await bchjs.Mnemonic.toSeed(mnemonic);
    console.log('test root', rootSeed)
    const masterHDNode = bchjs.HDNode.fromSeed(rootSeed);

    console.log('BIP44 Account: "m/44\'/145\'/0\'"');
    outStr += 'BIP44 Account: "m/44\'/145\'/0\'"\n';

    const childNode = masterHDNode.derivePath(`m/44'/145'/0'/0/0`);
    console.log("test node:", childNode);
    const address = bchjs.HDNode.toCashAddress(childNode);
    const legacyAddress = bchjs.HDNode.toLegacyAddress(childNode);
    
    const privateKey = bchjs.HDNode.toWIF(childNode);

    console.log(`Address: ${ legacyAddress}`);
    console.log(`Private Key: ${privateKey}`);
};

export { generateMnemonic, generateKeys, makeTransaction, testingNode };