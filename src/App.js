import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "./contracts/abi.json";

const contractAddress = "0xc5c97AAd92a962396229cbC8392e62585B04DfB3"; // Add your contract address here

let web3 = new Web3(window.ethereum); 
let contract = new web3.eth.Contract(contractABI, contractAddress);

function App() {
  const [connected, setConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [tweets, setTweets] = useState([]);
  const [newTweet, setNewTweet] = useState("");

  useEffect(() => {
    if (connected && userAddress) {
      displayTweets(userAddress);
    }
  }, [connected, userAddress]);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setUserAddress(accounts[0]);
        setConnected(true);
      } catch (error) {
        console.error("User rejected request:", error);
      }
    } else {
      console.error("No web3 provider detected");
    }
  }

  async function createTweet(content) {
    const accounts = await web3.eth.getAccounts();
    try {
      await contract.methods.createTweet(content).send({ from: accounts[0] });
      displayTweets(accounts[0]);
    } catch (error) {
      console.error("Error creating tweet:", error);
    }
  }

  async function displayTweets(userAddress) {
    try {
      const tempTweets = await contract.methods.getAllTweets().call({ from: userAddress });
      const sortedTweets = tempTweets.sort((a, b) => b.timestamp - a.timestamp);
      setTweets(sortedTweets);
    } catch (error) {
      console.error("Error fetching tweets:", error);
    }
  }

  async function likeTweet(author, id) {
    try {
      await contract.methods.likeTweet(author, id).send({ from: userAddress });
      displayTweets(userAddress);
    } catch (error) {
      console.error("Error liking tweet:", error);
    }
  }

  function shortAddress(address, startLength = 6, endLength = 4) {
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
  }

  return (
    <div className="container">
      <h1>Blockchain Chat</h1>
      <div className="connect">
        {!connected ? (
          <button id="connectWalletBtn" onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <p>Connected as: {shortAddress(userAddress)}</p>
        )}
      </div>
      {connected && (
        <>
          <form id="tweetForm"
            onSubmit={(e) => {
              e.preventDefault();
              createTweet(newTweet);
            }}
          >
            <input
              type="text"
              value={newTweet}
              onChange={(e) => setNewTweet(e.target.value)}
              placeholder="What's happening?"
              id="tweetContent"
              required
            />
            <button id="tweetSwubmitBtn" type="submit">Tweet</button>
          </form>

          <div id="tweetsContainer">
            {tweets.length === 0 ? (
              <p>No tweets yet.</p>
            ) : (
              tweets.map((tweet, index) => (
                <div key={index} className="tweet">
                  <img
                    className="user-icon"
                    src={`https://avatars.dicebear.com/api/human/${tweet.author}.svg`}
                    alt="User Icon"
                  />
                  <div className="tweet-inner">
                    <div className="author">{shortAddress(tweet.author)}</div>
                    <div className="content">{tweet.content}</div>
                    <button
                      className="like-button"
                      onClick={() => likeTweet(tweet.author, tweet.id)}
                    >
                      <i className="far fa-heart"></i> {tweet.likes}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
