"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import axios from "axios";

export default function Home() {
  const [mnemonicPhrase, setMnemonicPhrase] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [coin, setCoin] = useState("");

  const generateMnemonic = async () => {
    try {
      const response = await axios.get("http://localhost:8000/generateMnemonic", {
        params: { salt : passphrase },
      });
      setMnemonicPhrase(response.data);
    } catch (error) {
      console.log(error)
    };
  };

  const generateKeys = async () => {
    try {
      const response = await axios.get("http://localhost:8000/generateKeys", {
        params: { mnemonic : mnemonicPhrase, passphrase : passphrase, coin : coin },
      });
      console.log(response.data);
      const keys = response.data;
      setAddress(keys.address);
      setPublicKey(keys.publicKey);
      setPrivateKey(keys.privateKey);
    } catch (error) {
      console.log(error);
    };
  };
  const testing = async () => {
    try {
      const response = await axios.get('http://localhost:8000/testing')
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
      <button onClick = { generateMnemonic }>Generate Mnemonic</button>

      <div>Public Key: { publicKey }</div>
      <div>Address: { address }</div>
      <div>Private Key: { privateKey }</div>
      <button onClick = { generateKeys } >har har har </button>

      <input onChange={(e) => {
          setCoin(e.target.value);
      }} ></input>
       <Link href="/transaction">Transactions</Link>

    </>
  );
}
