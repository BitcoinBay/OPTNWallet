import React, { useState, useEffect } from 'react'
import { generateMnemonic, generateKeys } from '../apis/WalletInformation/KeyGeneration'
import ElectrumService from '../apis/ElectrumServer/ElectrumServer';
import Transactions from '../apis/Transaction';

const Home = () => {
    const [mnemonicPhrase, setMnemonicPhrase] = useState("");
    const [passphrase, setPassphrase] = useState("");
    const [publicKey, setPublicKey] = useState("");
    const [address, setAddress] = useState("");
    const [privateKey, setPrivateKey] = useState<Uint8Array | null>(null)
    const [bchBalance, setBchBalance] = useState("");
    const [coin, setCoin] = useState("");
    const [utxos, setUtxos] = useState([]);
    const Electrum = ElectrumService();
    const Transaction = Transactions();
    useEffect(()=> {
        async function startServer() {
          try {
              await Electrum.electrumConnect()
              console.log('Successfully connected to the Chipnet network');
          } catch (error) {
              console.error('An error occurred:', error);
          }
      }
      startServer();
    }, []);

    const handleGenerateMnemonic = async () => {
      const mnemonic = await generateMnemonic();
      setMnemonicPhrase(mnemonic);
    };

    const generateKey = async () => {
      try {
        const keys = await generateKeys(mnemonicPhrase, passphrase, coin);
        console.log(keys)
        setAddress(keys.aliceAddress)
        setPrivateKey(keys.alicePriv)
        setPublicKey(keys.changeAddress)
      } catch (error) {
        console.log(error);
      };
    };

    const handleDisconnectServer = async() => {
        await Electrum.electrumDisconnect(true);
        console.log('Disconnected from the network');
    }

    const handleRequestBalance = async() => {
      const address1 = "bchtest:qznwqlqtzgqkxpt6gp92da2peprj3202s53trwdn7t";
      const balance = await Electrum.getBalance(address1);
      console.log(typeof(balance));
      console.log(balance);
      setBchBalance(balance);
    }
    
    const handleGetUtxos = async() => {
      const address1 = "bchtest:qznwqlqtzgqkxpt6gp92da2peprj3202s53trwdn7t";
      const utxoValues = await Electrum.getUTXOS(address1)
      console.log(utxoValues);
      setUtxos(utxoValues);

    };

    const handleBuildTransaction = async() => {
      console.log(utxos[0])
      const transaction = await Transaction.buildTransaction(utxos[0])
      console.log('transaction', transaction)
      const Electrum = ElectrumService();
      console.log('har har har',transaction.hex)
      const result = await Electrum.broadcastTransaction(transaction.hex);
      console.log("result", result)
      console.log("txhash", transaction.txid)
      const isSuccess = result === transaction.txid;
      console.log(isSuccess)
      
    };

    return (
      <>
        <div className = "">Landing Page</div>
        <div>Set Passphrase</div>
        <input onChange={(e) => {
            setPassphrase(e.target.value);
        }}></input>
        <div>Mnemonic Value: { mnemonicPhrase }</div>
        <button onClick = { handleGenerateMnemonic }>Generate Mnemonic</button>

        <div>Public Key: { publicKey }</div>
        <div>Address: { address }</div>
        <div>Private Key: { privateKey }</div>
        <button onClick = { generateKey } >Generate Keys</button>

        <input placeholder = "set coin" onChange={(e) => {
            setCoin(e.target.value);
        }} ></input>

        <button onClick = { handleDisconnectServer }>Disconnect server</button>

        <div>balance: { bchBalance }</div>

        <button onClick = {handleRequestBalance}> request balance</button>

        <div>utxos: {} </div>
        <button onClick = { handleGetUtxos }> get utxos</button>

        <button onClick = { handleBuildTransaction }>build transaction</button>
      </>
  )
}

export default Home