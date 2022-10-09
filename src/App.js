import "./styles/App.css";
import { ethers, Contract } from "ethers";
import React, { useEffect, useState } from "react";
import sic from "./utils/SIC.json";
import BadgesABI from "./utils/BadgesABI.json"; // Link at the end of the tutorial
import { Badges } from "./utils/BadgesType.ts"; // Link at the end of the tutorial

const CONTRACT_ADDRESS = "0x349E832e461309c00a2432E258403C2b6Aa1C47D";
const SISMO_BADGES_CONTRACT = "0xE06B14D5835925e1642d7216F4563a1273509F10"
const EthereumPowerUserTokenId = 10000005;

const App = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [signatures, setSignatures] = useState([]);
    const [tokens, setTokens] = useState([]);
    const [mintTokenSign, setMintTokenSign] = useState("token signature...");
    const [mintTokenContent, setMintTokenContent] = useState("token content...");
    const [transferTokenSign, setTransferTokenSign] = useState("token signature...");
    const [transferContract, setTransferContract] = useState("destintation contract...");
    const [contract, setContract] = useState(CONTRACT_ADDRESS);
    const [sismo, setSismo] = useState(false);

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
                const connectedContract = new ethers.Contract(contract, sic.abi, signer);
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
                const connectedContract = new ethers.Contract(contract, sic.abi, signer);

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
                const connectedContract = new ethers.Contract(contract, sic.abi, signer);

                console.log("Going to pop wallet now to pay gas...");
                const sig = ethers.utils.formatBytes32String(transferTokenSign);
                var destContract = transferContract;
                if (!destContract.startsWith("0x")) {
                    // Resolve ENS test field 'sic'
                    console.log("Finding the contract using ENS")
                    const resolver = await provider.getResolver(destContract);
                    const sic = await resolver.getText('sic');
                    destContract = sic;
                    console.log("Contract found in ENS: ", destContract);
                }
                if (sismo) {
                    console.log("Checking SISMO...");
                    // Check if user is sismo Ehtereum Power User Badge Owner
                    const badgesContract = new Contract(
                        SISMO_BADGES_CONTRACT, 
                        BadgesABI, 
                        provider 
                    );
                    const addr = await provider.getSigner().getAddress();
                    const balance = await badgesContract.balanceOf(addr, EthereumPowerUserTokenId);
                    // check if user has the badge
                    if (balance.gt(0)) { 
                        console.log("You have the Ethereum Power User badge, well done!")
                    } else { 
                        console.log("You don't have the Ethereum Power User badge.") 
                        return;
                    }
                }
                let nftTxn = await connectedContract.transfer(sig, destContract);

                console.log("Transfering...please wait.");
                await nftTxn.wait();
                console.log(nftTxn);
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

        const interval = setInterval(() => {
            setupEventListener();
          }, 10000);
          return () => clearInterval(interval);
    }, [contract]);

    const renderNotConnectedContainer = () => (
        <button onClick={connectWallet} className="cta-button connect-wallet-button">
            Connect to Wallet
        </button>
    );

    const renderContract = () => (
        <div>
          <input
              type="text"
              placeholder={contract}
              onChange={(e) => setContract(e.target.value)}
          ></input>
        </div>
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
        {signatures.map((sig, i)=><div key="{sig}" className="token">{ethers.utils.parseBytes32String(sig)} : {tokens[i]}</div>)}
      </div>
    );

    const renderSismoToggle = () => (
        <div>
        <input
        type="checkbox"
        onChange={(e) => setSismo(e.target.checked)}
        ></input>
        <div className="token">Transfer to only when Sismo Ethereum Power User Badge Holder</div>
        </div>
    )

    return (
        <div className="App">
            <div className="container">
                <div className="header-container">
                    <p className="header gradient-text">SIGN</p>
                    {renderContract()}
                    <p className="sub-text">Each unique. Each beautiful. Discover your NFT today.</p>
                    {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
                  {currentAccount === "" || renderMinted()}
                  {currentAccount === "" || renderTransferUI()}
                  {currentAccount === "" || renderSismoToggle()}
                </div>
                
            </div>
        </div>
    );
};

export default App;
