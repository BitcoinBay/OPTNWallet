import React, { useState, useEffect } from 'react'
import { generateMnemonic, generateKeys } from '../apis/WalletInformation/KeyGeneration'
import { initElectrum, shutdownElectrum } from '../apis/ElectrumServer/ElectrumServer'

const Home = () => {
    const [mnemonicPhrase, setMnemonicPhrase] = useState("");
    const [passphrase, setPassphrase] = useState("");
    const [publicKey, setPublicKey] = useState("");
    const [address, setAddress] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [coin, setCoin] = useState("");
    useEffect(()=> {
        initElectrum();
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

        <input onChange={(e) => {
            setCoin(e.target.value);
        }} ></input>
      </>
  )
}

export default Home