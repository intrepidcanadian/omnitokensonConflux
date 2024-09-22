import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Bounce, toast } from 'react-toastify';
import { OFTContracts } from './constant/constants';
import contractABI from './abis/MyOFT.sol/MyOFT.json';
import { EndpointId } from '@layerzerolabs/lz-definitions';
import accountService from './services/accountService';
import { getBytes, zeroPadBytes } from 'ethers';
import { Options } from '@layerzerolabs/lz-v2-utilities';
import './TokenTransfer.css';

const TokenTransfer = () => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState('');
  const [sourceChain, setSourceChain] = useState('sepolia');
  const [destinationChain, setDestinationChain] = useState('confluxTestnet');
  const [chain, setChain] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenBalance, setTokenBalance] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [signer, setSigner] = useState('');
  const [provider, setProvider] = useState(null);

  const networkParams = {
    sepolia: {
      chainId: '0xaa36a7', // 11155111 in hex
      chainName: 'Sepolia Testnet',
      rpcUrls: ['https://rpc.sepolia.org'],
      nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
      blockExplorerUrls: ['https://sepolia.etherscan.io'],
    },
    confluxTestnet: {
      chainId: '0x47', // 71 in hex
      chainName: 'Conflux EVM Testnet',
      rpcUrls: ['https://evmtestnet.confluxrpc.com'],
      nativeCurrency: { name: 'CFX', symbol: 'CFX', decimals: 18 },
      blockExplorerUrls: ['https://evmtestnet.confluxscan.net'],
    },
  };

  const switchNetwork = async (chain) => {
    const params = networkParams[chain];
    if (!params) {
      console.error('Unsupported chain');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: params.chainId }],
      });
      console.log(`Switched to ${params.chainName}`);
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [params],
          });
        } catch (addError) {
          console.error('Failed to add the network to MetaMask:', addError);
        }
      } else {
        console.error('Failed to switch the network:', switchError);
      }
    }
  };

  const updateProviderAndSigner = async (chain) => {
    const { chainId, rpcUrl } = getChainParams(chain);
    try {
      const { provider, signer, walletAddress } = await accountService.connectWallet(chainId, rpcUrl);
      setProvider(provider);
      setSigner(signer);
      setWalletAddress(walletAddress);
    } catch (error) {
      console.error('Failed to update provider and signer:', error);
    }
  };

  const handleSourceChainChange = async (e) => {
    const newSourceChain = e.target.value;
    setSourceChain(newSourceChain);
    setDestinationChain(newSourceChain === 'sepolia' ? 'confluxTestnet' : 'sepolia');
    await switchNetwork(newSourceChain);
    await updateProviderAndSigner(newSourceChain); // Update provider and signer after switching network
    fetchTokenDetails(newSourceChain);
  };

  const getChainParams = (chain) => {
    if (chain === 'sepolia') {
      return { chainId: 11155111, rpcUrl: 'https://rpc.sepolia.org' };
    } else if (chain === 'confluxTestnet') {
      return { chainId: 71, rpcUrl: 'https://evmtestnet.confluxrpc.com' };
    }
    return null;
  };

  const fetchTokenDetails = async (chain) => {
    try {
      const { chainId, rpcUrl } = getChainParams(chain);
      const { provider, signer, walletAddress } = await accountService.connectWallet(chainId, rpcUrl);
      console.log(provider, signer, walletAddress);
      if (!provider || !signer) {
        throw new Error('Failed to connect wallet');
      }

      let sourceContract;
      if (chain === 'sepolia') {
        sourceContract = new ethers.Contract(OFTContracts.sepolia.contractAddress, contractABI.abi, signer);
      } else if (chain === 'confluxTestnet') {
        sourceContract = new ethers.Contract(OFTContracts.confluxTestnet.contractAddress, contractABI.abi, signer);
      }

      const name = await sourceContract.name();
      const symbol = await sourceContract.symbol();
      const balance = await sourceContract.balanceOf(walletAddress);

      setChain(chainId);
      setTokenBalance(ethers.formatEther(balance));
      setTokenName(name);
      setTokenSymbol(symbol);
    } catch (error) {
      console.error(`Error fetching token details for ${chain}:`, error);
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            fetchTokenDetails(sourceChain);
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
        }
      } else {
        console.error('MetaMask is not installed');
      }
    };

    checkWalletConnection();

    // Listen for network changes
    window.ethereum.on('chainChanged', (chainId) => {
      // Convert chainId to a decimal number
      const networkName = Object.keys(networkParams).find(
        (key) => networkParams[key].chainId === chainId
      );
      if (networkName) {
        setSourceChain(networkName);
        setDestinationChain(networkName === 'sepolia' ? 'confluxTestnet' : 'sepolia');
        updateProviderAndSigner(networkName); // Update provider and signer for the new network
        fetchTokenDetails(networkName);
      }
    });
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const { chainId, rpcUrl } = getChainParams(sourceChain);
      const walletData = await accountService.connectWallet(chainId, rpcUrl);
      if (walletData) {
        setSigner(walletData.signer);
        setProvider(walletData.provider);
        fetchTokenDetails(sourceChain);
      }
    };

    initialize();
  }, [sourceChain]);

  const handleTransfer = async () => {
    try {
      toast('🦄 Initiating transfer...', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      });

      const { signer } = await accountService.connectWallet(11155111, 'https://rpc.sepolia.org'); // Use Sepolia's chainId and RPC URL

      let sourceContract, dstChainId;

      if (sourceChain === 'sepolia') {
        sourceContract = new ethers.Contract(OFTContracts.sepolia.contractAddress, contractABI.abi, signer);
        dstChainId = EndpointId.CONFLUX_V2_TESTNET;
      } else if (sourceChain === 'confluxTestnet') {
        sourceContract = new ethers.Contract(OFTContracts.confluxTestnet.contractAddress, contractABI.abi, signer);
        dstChainId = EndpointId.SEPOLIA_V2_TESTNET;
        console.log(dstChainId);
      }

      if (!dstChainId) {
        throw new Error('Destination chain ID is not defined');
      }

      const amountInWei = ethers.parseEther(amount);
      const recipientBytes32 = zeroPadBytes(getBytes(recipient), 32);

      const options = Options.newOptions().addExecutorLzReceiveOption(500000, 0).toHex().toString();

      const sendParam = [
        dstChainId,
        recipientBytes32,
        amountInWei,
        amountInWei,
        options,
        '0x',
        '0x',
      ];

      console.log('sendParam:', sendParam);

      if (!sourceContract.quoteSend) {
        throw new Error('quoteSend method not supported by the contract');
      }

      const [nativeFee] = await sourceContract.quoteSend(sendParam, false);

      console.log('nativeFee:', nativeFee);

      const tx = await sourceContract.send(sendParam, [nativeFee, 0], signer.getAddress(), { value: nativeFee });

      await tx.wait();
      toast('Transfer successful!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      });
      await fetchTokenDetails(sourceChain);
    } catch (error) {
      console.error('Error during transfer:', error);
      toast.error('Transfer failed! Please check the console for errors.');
    }
  };

  const connectToMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error('Failed to connect to MetaMask:', error);
        toast.error('Failed to connect to MetaMask');
      }
    } else {
      console.error('MetaMask is not installed');
      toast.error('MetaMask is not installed');
    }
  };

  const condensedAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="container">
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1rem',
          margin: '1rem',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <h1 className="title">Conflux Testnet-Sepolia LZ Bridge</h1>
        <button onClick={connectToMetaMask}>
          {walletAddress ? `Connected: ${condensedAddress(walletAddress)}` : 'Connect to MetaMask'}
        </button>
      </nav>

      <div className="network-section">
        <div className="network-box">
          <p className="network-label">Conflux Network</p>
        </div>
        <div className={`connector ${destinationChain === 'sepolia' ? 'right' : 'left'}`}>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
        <div className="network-box">
          <p className="network-label">Sepolia Network</p>
        </div>
      </div>
      <div className="circle-container">
  <div className="circle-content">
    <p className="token-info-item"><strong>Chain:</strong> {sourceChain || 'N/A'}</p>
    <p className="token-info-item"><strong>Token Name:</strong> {tokenName || 'N/A'}</p>
    <p className="token-info-item"><strong>Token Symbol:</strong> {tokenSymbol || 'N/A'}</p>
    <p className="token-info-item"><strong>Token Balance:</strong> {tokenBalance || 'N/A'}</p>
  </div>
</div>
      <div className="card">
        <div className="card-content">
          <h2>Omnichain Fungible Token Bridge Using LayerZero</h2>
          <div className="select-chain">
            <label>Source Chain:</label>
            <select value={sourceChain} onChange={handleSourceChainChange}>
              <option value="sepolia">Sepolia</option>
              <option value="confluxTestnet">Conflux Testnet</option>
            </select>
          </div>
          <div className="select-chain">
            <label>Destination Chain:</label>
            <input type="text" value={destinationChain} readOnly />
          </div>
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button className="transfer-button" onClick={handleTransfer}>
            Send Tokens
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenTransfer;
