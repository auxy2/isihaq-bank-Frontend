
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../Component";
import axios from "axios";
import { io } from "socket.io-client";
import "./Dashboard.css";
import tvImage from "../../assets/television.png";
import dataImage from "../../assets/api.png";
import airtimeImage from "../../assets/telephone.png";
import electricityImage from "../../assets/flash.png";
import transferImage from "../../assets/fund.png";
import errorIcon from "../../assets/user.png";
import chatIcon from "../../assets/chat.png";
import { Router } from "react-router-dom";

const UserDashboard = () => {
  const [username, setUsername] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const { user } = useContext(UserContext);
  const { setUser } = useContext(UserContext);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isTopUpFormOpen, setIsTopUpFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setWalletBalance(user.walletBalance);
        setUsername(user.username);
        setLoading(false);
        setUser(user);
      } else {
        setError("Failed to load dashboard data. Please check your connection or login again.");
        setLoading(false);
      }
    };

    const fetchBanks = async () => {
      try {
        const res = await axios.get("https://abank.vercel.app/api/banks");
        setBanks(res.data.data);
      } catch (err) {
        console.error("Error fetching bank list:", err);
      }
    };


    const socket = io("http://localhost:3464");
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("notification", (message) => {
      setNotifications((prevNotifications) => [...prevNotifications, message]);
    });

    socket.on("chat", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    fetchUserData();
    fetchBanks();

    return () => {
      socket.disconnect();
    };
  }, []);

  // const handleTopUp = async() => {
  //   try{
  //     console.log("Top Up")
  //     if (!username) {
  //       setError("Please login again.");
  //       // toggleTransferForm()
  //       return;
  //     }  
  //     const res = await axios.post("http://localhost:3464/api/topWallet", { username});
  //     console.log(res, res.data);
  //   }catch(err){
  //     console.log(err);
  //   }
  // }

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      setError("Please enter a valid amount to top up.");
      setIsTopUpFormOpen(false)
      return;
    }

    try {
      setIsTopUpFormOpen(false);
      console.log(username, topUpAmount);
      const res = await axios.post("http://localhost:3464/api/topWallet", {
        username,
        amount: topUpAmount,
      });

      if (res.data.success) {
        setWalletBalance((prev) => prev + parseFloat(topUpAmount));
        setError("");
        setTopUpAmount("");
        const url = res.data.data.authorization_url
        console.log(url);
        window.location.href = url;
        alert("Wallet successfully topped up!");
      } else {
        setError(res.data.message || "Failed to top up wallet. Please try again.");
      }
    } catch (err) {
      console.error("Top-up API error:", err);
      setError(err.response?.data?.message || "An unexpected error occurred.");
    }
  };

  const toggleTopUpForm = () => {
    setIsTopUpFormOpen(!isTopUpFormOpen);
    setTopUpAmount("");
  };

  const handleBankSelect = async (bankCode) => {
    setSelectedBank(bankCode);
    if (accountNumber) {
      try {
        const res = await axios.post("https://abank.vercel.app/api/account/verify", {
          accountNumber,
          bankCode,
        });
        setAccountName(res.data.data.account_name || res.data.data);
      } catch (err) {
        setAccountName("Could not resolve account name");
        setError("An error occurred while verifying the account. Please try again.");
      }
    }
  };

  const handleAccountNumberChange = (e) => {
    setAccountNumber(e.target.value);
    setAccountName("");
  };

  const closeError = () => {
    setError("");
  };

  const toggleTransferForm = () => {
    setIsTransferFormOpen(!isTransferFormOpen);
    setAccountName("");
    setAccountName("");
    setTransferAmount("")
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };


  const handleTransfer = async () => {
    if (!accountNumber || !selectedBank || !transferAmount) {
      setError("Please fill in all fields to proceed.");
      toggleTransferForm()
      return;
    }  
    try {
      setLoading(true);
      console.log(accountNumber, accountName, selectedBank, transferAmount);
      const response = await axios.post("https://abank.vercel.app/api/transfer", {
        username,
        accountNumber,
        accountName,
        bankCode: selectedBank,
        amount: transferAmount,
      });
      if (response.data.success) {
        setWalletBalance((prev) => prev - transferAmount); // Update wallet balance
        setError(""); // Clear any existing errors
        toggleTransferForm(); // Close the transfer form
        alert("Transfer successful!"); 
      } else {
        setError(response.data.message || "Transfer failed. Please try again.");
      }
    } catch (err) {
      console.log("Transfer API error:", err?.response?.data?.message);
      toggleTransferForm();
      setError(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSendMessage = () => {
    const socket = io("http://localhost:3464");
    socket.emit("chat", newMessage);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setNewMessage("");
  };

  if (loading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      {error && (
        <div className="error-modal">
          <div className="error-box">
            <img src={errorIcon} alt="Error" className="error-icon" />
            <p>{error}</p>
            <button onClick={closeError} className="error-close-button">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="user-info">
        <h2>Welcome, {username}</h2>
        <p>Wallet Balance: ₦{walletBalance.toFixed(2)}</p>
        <button onClick={toggleTopUpForm}>TOP UP</button>
      </div>
      {isTopUpFormOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Top Up Wallet</h3>
      <button onClick={toggleTopUpForm} className="close-button">X</button>
      <div className="form-group">
        <label>Enter Amount</label>
        <input
          type="number"
          value={topUpAmount}
          onChange={(e) => setTopUpAmount(e.target.value)}
          placeholder="Amount to top up"
        />
      </div>
      <button onClick={handleTopUp} className="submit-button">Submit</button>
    </div>
  </div>
)}

      <div className="actions-container">
        <div className="action-card" onClick={toggleTransferForm}>
          <img src={transferImage} alt="Transfer" />
          <button>Transfer</button>
        </div>
        <div className="action-card">
          <img src={tvImage} alt="TV" />
          <button> TV </button>
        </div>
        <div className="action-card">
          <img src={dataImage} alt="Data" />
          <button> Data </button>
        </div>
        <div className="action-card">
          <img src={airtimeImage} alt="Airtime" />
          <button> Airtime </button>
        </div>
        <div className="action-card">
          <img src={electricityImage} alt="Electricity" />
          <button> Electricity </button>
        </div>
      </div>

      {isTransferFormOpen && (
        <div className="transfer-form">
          <h3>Transfer Funds</h3>
          <button onClick={toggleTransferForm} className="close-transfer-button">X</button>
          <div className="form-group">
            <label>Account Number</label>
            <input
              type="number"
              value={accountNumber}
              placeholder="Account Number"
              onChange={handleAccountNumberChange}
            />
          </div>
          <div className="form-group">
            <label>Select Bank</label>
            <select
              value={selectedBank}
              onChange={(e) => handleBankSelect(e.target.value)}
            >
              <option value="">Select Bank</option>
              {banks.map((bank, index) => (
                <option key={index} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>
          {accountName && (
  <div className="account-name-container">
    <p className="account-name">{accountName}</p>
  </div>
)}
          {/* {accountName && <p className="account-name">Account Name: {accountName}</p>} */}
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <button onClick={handleTransfer}>Submit Transfer</button>
        </div>
      )}

      <div className="chat-icon-container" onClick={toggleChat}>
        <img src={chatIcon} alt="Chat" className="chat-icon" />
      </div>

      {isChatOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span>Chat</span>
            <button onClick={toggleChat}>X</button>
          </div>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
