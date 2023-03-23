import abi from '../utils/BuyMeACoffee.json';
import { ethers } from "ethers";
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css'

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x2581e48e5E7B1B16C40dF966B8eFdEEA96a4EF9a";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }
  // eth_accounts is a method of the Ethereum provider API that returns a list of the currently connected Ethereum accounts. This method does not request permission to connect to the user's Ethereum wallet, and it only returns the accounts that have already been granted permission to the website. If no accounts are connected, it returns an empty array.

  // eth_requestAccounts, on the other hand, is a method that requests permission from the user to connect to their Ethereum wallet. It prompts the user to choose an account and grants permission to the website to interact with that account. If the user accepts, it returns an array of accounts that can be used to sign transactions and interact with the Ethereum network.

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: 'eth_accounts' })
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..")
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther("0.001") }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // When a new memo event is emitted, the onNewMemo function is called with the event's parameters.
      buyMeACoffee.on("NewMemo", onNewMemo);
    }
    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    }
  }, []);

  return (
    <div className={styles.container} style={{ background: "linear-gradient(135deg, #000428 , #004e92 )" }}>
      <Head>
        <title>DeFi Tipping Dapp!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title} style={{ color: "yellow" }}>
          Lend CryptoSeekers some tokens!
        </h1><br/>

        {currentAccount ? (
          <div>
            <form>
              <div>
                <label style={{ color: "white" ,fontSize:"20px" }}>
                  Name
                </label>
                <br /><br/>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  onChange={onNameChange}
                  style={{ color: "black", borderRadius: "4px", padding: "12px", boxSizing: "border-box", border: "none" }}
                />
              </div>
              <br />
              <div>
                <label style={{ color: "white",fontSize:"20px" }}>
                  Send crypto seekers a message
                </label>
                <br />
                <br />

                <textarea
                  rows={3}
                  placeholder="Enjoy your coffee!"
                  id="message"
                  onChange={onMessageChange}
                  required
                  style={{ color: "black", borderRadius: "4px", padding: "12px", boxSizing: "border-box", border: "none" }}
                >
                </textarea>
              </div>
              <div>
                <button
                  type="button"
                  onClick={buyCoffee}
                  style={{ color: "black", borderRadius: "4px", padding: "12px", boxSizing: "border-box", border: "none" }}
                >
                  Send 1 Coffee for 0.001ETH
                </button>
              </div><br />
            </form>
          </div>
        ) : (
            <button onClick={connectWallet} style={{ backgroundColor: "#fdfd96", color: "blue", borderRadius: '4px', padding: "12px 24px", fontSize: "16px", transition: "background-color 0.3s ease" }} > Connect your wallet </button>
          )}
      </main>

      {currentAccount && (<h1 style={{ color: "white" }}>Memos received</h1>)}

      {currentAccount && (memos.map((memo, idx) => {
        return (
          <div key={idx} style={{ border: "2px solid white", "borderRadius": "5px", padding: "5px", margin: "5px" }}>
            <p style={{ "fontWeight": "bold", color: "yellow" }}>"{memo.message}"</p>
            <p style={{ color: "white" }}>From: {memo.name} at {memo.timestamp.toString()}</p>
          </div>
        )
      }))}

      <footer className={styles.footer}>
        Created by crypto seekers

      </footer>
    </div>
  )
}
