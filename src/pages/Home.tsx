import React, { useState, useEffect } from 'react'
import { generateMnemonic, generateKeys } from '../apis/WalletInformation/KeyGeneration'
import ElectrumService from '../apis/ElectrumServer/ElectrumServer';

const Home = () => {
    const [mnemonicPhrase, setMnemonicPhrase] = useState("");
    const [passphrase, setPassphrase] = useState("");
    const [publicKey, setPublicKey] = useState("");
    const [address, setAddress] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [bchBalance, setBchBalance] = useState();
    const [coin, setCoin] = useState("");
    const Electrum = ElectrumService();
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
        setAddress(keys.address.address)
      } catch (error) {
        console.log(error);
      };
    };

    const handleDisconnectServer = async() => {
        await Electrum.electrumDisconnect(true);
        console.log('Disconnected from the network');
    }
    const handleRequestBalance = async() => {
      const address1 = "bchtest:pdayzgu6vnpwsgkjpzhp7d8fmr9e3ugn7w6umre4w9tv6862l0y76sxcklaq8";
      const balance = await Electrum.getBalance(address1);  // Properly call the function with an address
      console.log(typeof(balance));
      console.log(balance);
    }

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

        <div>{ bchBalance }</div>

        <button onClick = {handleRequestBalance}> request balance</button>
      </>
  )
}

export default Home