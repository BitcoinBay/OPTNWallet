import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KeyGeneration from '../apis/WalletManager/KeyGeneration';
import { useDispatch } from 'react-redux';
import { setWalletId } from '../redux/walletSlice';
import WalletManager from '../apis/WalletManager/WalletManager';

const WalletImport = () => {
    const [mnemonicPhrase, setMnemonicPhrase] = useState('');
    const [walletName, setWalletName] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [isMainnet, setIsMainnet] = useState(false);
    const [walletDetails, setWalletDetails] = useState(null);
    const navigate = useNavigate();
    const KeyGen = KeyGeneration();
    const WalletManage = WalletManager();
    const dispatch = useDispatch();

    const handleImportAccount = async () => {
        try {
            const walletData = await KeyGen.generateKeys(mnemonicPhrase, passphrase, 0, isMainnet);
            if (walletData) {
                setWalletDetails(walletData);
                const queryResult = await WalletManage.createWallet(walletName, mnemonicPhrase, passphrase);
                if (queryResult) {
                    dispatch(setWalletId(walletName));
                    navigate(`/home/${walletName}`);
                }
            }
        } catch (error) {
            console.error('Error importing wallet:', error);
        }
    };

    return (
        <div className="wallet-import-box">
            <div className="text-black font-bold text-xl">Import Wallet</div>
            <div>Enter Mnemonic Phrase</div>
            <input
                type="text"
                onChange={(e) => setMnemonicPhrase(e.target.value)}
            />
            <div>Set your wallet Name</div>
            <input
                onChange={(e) => setWalletName(e.target.value)}
            />
            <div>Set passphrase</div>
            <input
                type="password"
                onChange={(e) => setPassphrase(e.target.value)}
            />
            <div>
                <label>
                    <input
                        type="radio"
                        value="mainnet"
                        checked={isMainnet}
                        onChange={() => setIsMainnet(true)}
                    />
                    Mainnet
                </label>
                <label>
                    <input
                        type="radio"
                        value="testnet"
                        checked={!isMainnet}
                        onChange={() => setIsMainnet(false)}
                    />
                    Testnet/Chipnet
                </label>
            </div>
            <button onClick={ handleImportAccount }>Import account</button>
            {walletDetails && (
                <div className="wallet-details">
                    <div>Public Key: {walletDetails.alicePub.toString('hex')}</div>
                    <div>Private Key: {walletDetails.alicePriv.toString('hex')}</div>
                    <div>Address: {walletDetails.aliceAddress}</div>
                </div>
            )}
        </div>
    );
};

export default WalletImport;
