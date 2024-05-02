"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [mnemonicPhrase, setMnemonicPhrase] = useState("");
  const [passphrase, setPassphrase] = useState("");

  const generateMnemonic = async () => {
    try {
      const response = await axios.get("http://localhost:8000/generateMnemonic", {
        params: { salt : passphrase },
      });
      console.log(response.data);
      setMnemonicPhrase(response.data);
    } catch (error) {
      console.log(error)
    };
  };

  const generateKeys = async () => {
    try {
      const response = await axios.get("http://localhost:8000/generateMnemonic", {
        params: { salt : passphrase },
      });
      console.log(response.data);
    } catch (error) {
      console.log(error)
    };
  };

  return (
    <>
      <div className = "">Landing Page</div>
      <input onChange={(e) => {
          setPassphrase(e.target.value);
      }}></input>
      <div>Mnemonic Value: { mnemonicPhrase }</div>
      <button onClick = { generateMnemonic }>Generate Mnemonic</button>
      <div></div>

    </>
  );
}
