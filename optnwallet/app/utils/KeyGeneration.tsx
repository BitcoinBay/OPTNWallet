import { BIP32Factory } from 'bip32';
import { useState } from "react";
import Link from 'next/link';
import {
    deriveHdPrivateNodeFromSeed,
    encodeHdPrivateKey,
    deriveHdPublicNode,
    encodeHdPublicKey,
} from "@bitauth/libauth";
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import BCHJS from '@psf/bch-js';


const KeyGeneration = () => {
    const [mnemonicPhrase, setMnemonicPhrase] = useState("");
    const [passphrase, setPassphrase] = useState("");
    const [publicKey, setPublicKey] = useState("");
    const [address, setAddress] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [coin, setCoin] = useState("");
    const network = bitcoin.networks.mainnet;
    const BCHN_MAINNET = 'https://bchn.fullstack.cash/v5/'

    const bchjs = new BCHJS({ restURL: BCHN_MAINNET })

    const lang = 'english'

    async function generateMnemonicWithSalt() {
        const length = 256;
        const mnemonic = await bip39.generateMnemonic(length);
        return mnemonic;
    };

    const generateMnemonic = async () => {
        const result = await generateMnemonicWithSalt();
        setMnemonicPhrase(result);
    };

    const generateKeys = (mnemonic, passphrase, coin) => {
        try {
            const seed = bip39.mnemonicToSeed(mnemonic);
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
            setAddress(address);
            setPublicKey(publicKey);
            setPrivateKey(privateKey);
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

    const testing = () => {
        let outStr = "";
        let outObj = {};
        const mnemonic = "tonight wealth inch quantum hair leg steel industry weapon suggest picnic year group say brown scrub tattoo arrive ride slab wing glass cliff garage";
        outStr += 'BIP44 $BCH Wallet\n';
        console.log(`128 bit BIP39 Mnemonic: `, mnemonic);
        outStr += `\n128 bit BIP39 Mnemonic:\n${mnemonic}\n\n`;
        outObj.mnemonic = mnemonic;

        const rootSeed = bchjs.Mnemonic.toSeed(mnemonic);
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
    return (
        <>
            <button onClick = { testing }>testing</button>
            <div className = "">Landing Page</div>
            <div>Set Passphrase</div>
            <input onChange={(e) => {
                setPassphrase(e.target.value);
            }}></input>
            <div>Mnemonic Value: { mnemonicPhrase }</div>
            <button onClick = { generateMnemonic }>Generate Mnemonic</button>

            <div>Public Key: { publicKey }</div>
            <div>Address: { address }</div>
            <div>Private Key: { privateKey }</div>
            <button onClick = { generateKeys } >Generate Keys</button>

            <input onChange={(e) => {
                setCoin(e.target.value);
            }} ></input>
            <Link href="/transaction">Transactions</Link>
        </>
    )
};

export default KeyGeneration