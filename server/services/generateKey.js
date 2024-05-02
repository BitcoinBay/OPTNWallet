import BIP32Factory from 'bip32';
import * as bip39 from 'bip39';

async function generateMnemonicWithSalt(passphrase) {
    const length = 256;
    const mnemonic = await bip39.generateMnemonic(length);
    return mnemonic;
}

const generateMnemonic = async (req, res) => {
    const salt = req.query.salt;

    try {
        const result = await generateMnemonicWithSalt(salt);
        console.log("Mnemonic:", result.mnemonic);
        console.log("Seed:", result.seed);
        res.json(result);
    } catch (error) {
        console.error('Error generating mnemonic:', error);
        res.status(500).send('Failed to generate mnemonic');
    }
};

const { xpriv, numKeys, rootPrivateKey } = req.query;
const path = `m/44'/0'/0'/0/0`;

if (!xpriv) {
    return res.status(400).send("missing xpriv key");
}
if (!numKeys) {
    return res.status(400).send("missing numKeys");
}
const derivedKeys = [];
for (let i = 0; i < numKeys; i++) {
    const rootNode = bip32.fromBase58(xpriv);
    const childNode = rootNode.derivePath(`${path}/${i}`);
    const publicKey = childNode.publicKey;
    const privateKeyWIF = childNode.toWIF();
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');
    const publicKeyHex = publicKeyBuffer.toString('hex');
    const address = bitcoin.payments.p2pkh({ pubkey: publicKeyBuffer }).address;
    derivedKeys.push({
        address: address,
        publicKey: publicKeyHex,
        privateKey: privateKeyWIF
    });
}

export { generateMnemonic };