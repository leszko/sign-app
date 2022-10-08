import "./styles/App.css";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import sic from "./utils/SIC.json";

const CONTRACT_ADDRESS = "0x4383D71A2E3d314C91e2cB8aFEe997Cf72c043e4";

const App = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [signatures, setSignatures] = useState([]);
    const [tokens, setTokens] = useState([]);
    const [mintTokenSign, setMintTokenSign] = useState("token signature...");
    const [mintTokenContent, setMintTokenContent] = useState("token content...");
    const [transferTokenSign, setTransferTokenSign] = useState("token signature...");
    const [transferContract, setTransferContract] = useState("destintation contract...");

    const checkIfWalletIsConnected = async () => {
        const { ethereum } = window;

        if (!ethereum) {
            console.log("Make sure you have metamask!");
            return;
        } else {
            console.log("We have the ethereum object", ethereum);
        }

        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);
            setCurrentAccount(account);
            setupEventListener();
        } else {
            console.log("No authorized account found");
        }
    };

    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }

            const accounts = await ethereum.request({ method: "eth_requestAccounts" });

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
            setupEventListener();
        } catch (error) {
            console.log(error);
        }
    };

    // Setup our listener.
    const setupEventListener = async () => {
        // Most of this looks the same as our function askContractToMintNft
        try {
            const { ethereum } = window;

            if (ethereum) {
                // Same stuff again
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, sic.abi, signer);
                const sigs = await connectedContract.getSignatures();
                console.log(`All minted: `, sigs);
                const values = [];
                for (const s of sigs) { 
                    values.push(await connectedContract.tokenURI(s));
                }
                setSignatures(sigs)
                setTokens(values);
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const askContractToMintNft = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, sic.abi, signer);

                console.log("Going to pop wallet now to pay gas...");
                const sig = ethers.utils.formatBytes32String(mintTokenSign);
                const content = mintTokenContent;
                let nftTxn = await connectedContract.mint(sig, content);

                console.log("Mining...please wait.");
                await nftTxn.wait();
                console.log(nftTxn);
                console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
                const sigs = await connectedContract.getSignatures();
                console.log(`All minted: `, sigs);
                const values = [];
                for (const s of sigs) { 
                    values.push(await connectedContract.tokenURI(s));
                }
                setSignatures(sigs)
                setTokens(values);
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    };

  const askContractToTransferNft = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, sic.abi, signer);

                console.log("Going to pop wallet now to pay gas...");
                const sig = ethers.utils.formatBytes32String(transferTokenSign);
                const destContract = transferContract;
                let nftTxn = await connectedContract.transfer(sig, destContract);

                console.log("Transfering...please wait.");
                await nftTxn.wait();
                console.log(nftTxn);
                console.log(`Transfered, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
                const sigs = await connectedContract.getSignatures();
                console.log(`All minted: `, sigs);
                const values = [];
                for (const s of sigs) { 
                    values.push(await connectedContract.tokenURI(s));
                }
                setSignatures(sigs)
                setTokens(values);
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    const renderNotConnectedContainer = () => (
        <button onClick={connectWallet} className="cta-button connect-wallet-button">
            Connect to Wallet
        </button>
    );

    const renderMintUI = () => (
      <div>
        <input
            type="text"
            placeholder={mintTokenSign}
            onChange={(e) => setMintTokenSign(e.target.value)}
        ></input>
        <input
            type="text"
            placeholder={mintTokenContent}
            onChange={(e) => setMintTokenContent(e.target.value)}
        ></input>
        <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
            Mint NFT
        </button>
        </div>
    );

  const renderTransferUI = () => (
      <div>
        <input
            type="text"
            placeholder={transferTokenSign}
            onChange={(e) => setTransferTokenSign(e.target.value)}
        ></input>
        <input
            type="text"
            placeholder={transferContract}
            onChange={(e) => setTransferContract(e.target.value)}
        ></input>
        <button onClick={askContractToTransferNft} className="cta-button connect-wallet-button">
            Transfer NFT
        </button>
        </div>
    );

    const renderMinted = () => (
      <div>
        {signatures.map((sig, i)=><div key="{sig}">{ethers.utils.parseBytes32String(sig)} : {tokens[i]}</div>)}
      </div>
    );

    return (
        <div className="App">
            <div className="container">
                <div className="header-container">
                    <p className="header gradient-text">My NFT Collection</p>
                    <p className="sub-text">Each unique. Each beautiful. Discover your NFT today.</p>
                    {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
                  {currentAccount === "" || renderMinted()}
                  {currentAccount === "" || renderTransferUI()}
                </div>
                
            </div>
        </div>
    );
};

export default App;
