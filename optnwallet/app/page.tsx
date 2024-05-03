"use client";


import { useEffect, useState } from "react";
import Link from 'next/link';
import axios from "axios";
import { generateMnemonic, generateKeys, makeTransaction, testingNode } from "./utils/KeyGeneration";

export default function Home() {
  const [mnemonicPhrase, setMnemonicPhrase] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [coin, setCoin] = useState("");

  const handleGenerateMnemonic = () => {
    const mnemonic = generateMnemonic(passphrase);
    setMnemonicPhrase(mnemonic);
  };

  const generateKey = async () => {
    try {
      const keys = generateKeys(mnemonicPhrase, passphrase, coin);
      setAddress(keys.address);
      setPublicKey(keys.publicKey);
      setPrivateKey(keys.privateKey);
    } catch (error) {
      console.log(error);
    };
  };
  const testing = async () => {
    try {
      testingNode();

    } catch (error) {
      console.log(error);
    }
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
      <button onClick = { handleGenerateMnemonic }>Generate Mnemonic</button>

      <div>Public Key: { publicKey }</div>
      <div>Address: { address }</div>
      <div>Private Key: { privateKey }</div>
      <button onClick = { generateKey } >Generate Keys</button>

      <input onChange={(e) => {
          setCoin(e.target.value);
      }} ></input>
      <Link href="/transaction">Transactions</Link>

    </>
  );
}
