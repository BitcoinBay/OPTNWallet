import {
    deriveHdPrivateNodeFromSeed,
    encodeHdPrivateKey,
    deriveHdPublicNode,
    encodeHdPublicKey,
    deriveHdPrivateNodeFromBip39Mnemonic,
    hdPrivateKeyToP2pkhCashAddress,
} from '@bitauth/libauth';
import * as bip39 from "bip39";
import * as bitcoin from 'bitcoinjs-lib';

const generateMnemonic = () => {
    const mnemonic = bip39.generateMnemonic();
    return mnemonic;
};

const generateKeys = (mnemonic, passphrase, coin) => {
    const network = bitcoin.networks.testnet;
    const { hdPrivateKey } = encodeHdPrivateKey({
        network: 'testnet',
        node: deriveHdPrivateNodeFromBip39Mnemonic(mnemonic),
    });
    const coinType = {
        "BTC": "0",
        "LTC": "2",
        "BCH": "145"
    };
    const privateDerivationPath = `m/44'/145'/0'/0/i`;
    const addressIndex = 0;
    const { address } = hdPrivateKeyToP2pkhCashAddress({
        addressIndex,
        hdPrivateKey,
        privateDerivationPath,
    });
};

export { generateMnemonic };