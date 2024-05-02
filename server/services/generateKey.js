import * as assert from 'assert';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bip39 from 'bip39';
import bitcoin from 'bitcoinjs-lib';
const network = bitcoin.networks.mainnet;
const bip32 = BIP32Factory(ecc);

async function generateMnemonicWithSalt() {
    const length = 256;
    const mnemonic = await bip39.generateMnemonic(length);
    return mnemonic;
};

const generateMnemonic = async (req, res) => {
    const salt = req.query.salt;

    try {
        const result = await generateMnemonicWithSalt();
        res.json(result);
    } catch (error) {
        console.error(error);
    }
};

const generateKeys = async (req, res) => {
    const { mnemonic, passphrase, coin } = req.query;
    try {
        const seed = await bip39.mnemonicToSeed(mnemonic);
        console.log(coin);
        console.log(mnemonic);
        const root = bip32.fromSeed(seed, network);
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

        res.json({
            address: address,
            publicKey: publicKeyBuffer.toString('hex'),
            privateKey: privateKey
        });
    } catch (error) {
        console.log(error);
    };
};

const makeTransaction = async (req, res) => {
    try {

    } catch(error) {
        console.log(error);
    }
};


// REST API servers.
const BCHN_MAINNET = 'https://bchn.fullstack.cash/v5/'

// bch-js-examples require code from the main bch-js repo
import BCHJS from '@psf/bch-js';

// Instantiate bch-js.
const bchjs = new BCHJS({ restURL: BCHN_MAINNET })

const lang = 'english' // Set the language of the wallet.

const testing = async () => {
    let outStr = ""; // Initialize string to collect outputs
    let outObj = {}; // Initialize object to collect output values
  
    try {
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

        // Derive only the first path
        const childNode = masterHDNode.derivePath(`m/44'/145'/0'/0/0`);
        console.log("test node:", childNode);
        const address = bchjs.HDNode.toCashAddress(childNode);
        const legacyAddress = bchjs.HDNode.toLegacyAddress(childNode);
        
        const privateKey = bchjs.HDNode.toWIF(childNode);

        console.log(`Address: ${ legacyAddress}`);
        console.log(`Private Key: ${privateKey}`);

    } catch (err) {
        console.error('Error in createWallet(): ', err);
    };
};


export { generateMnemonic, generateKeys, makeTransaction, testing };