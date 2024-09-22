import { ethers } from 'ethers';

// accountService is the Web3Provider for connecting to Metamask through ethers.js

const getProvider = async (rpcUrl) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log("Provider created:", provider);
    return provider;
  } catch (error) {
    console.error("Failed to create provider:", error);
    return null;
  }
};

const getWalletAddress = async (signer) => signer?.getAddress();

const getSigner = async (provider) => {
    if (!provider) return null;
    console.log(provider);
  
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("Accounts:", accounts);
        console.log(accounts.length);
  
        if (accounts.length > 0) {
            console.log(accounts.length > 0);
            const signer = await provider.getSigner();
            console.log(signer);
          return signer;
        }
      } else {
        console.error("MetaMask is not installed");
      }
    } catch (error) {
      console.error("Failed to request accounts:", error);
    }
  
    return null;
  };

const checkNetwork = async (provider, chainId) => {
  if (!provider) return false;

  const network = await provider.getNetwork();
  console.log("Current network:", network);
  console.log(network.chainId);
  console.log(chainId);
  return network.chainId.toString() === chainId.toString();
};

const switchToChain = async (provider, chainId) => {
    console.log(chainId);
  try {
    await provider.send("wallet_switchEthereumChain", [
      { chainId: ethers.hexlify(chainId) },
    ]);
    console.log("Switched to chain:", chainId);
  } catch (error) {
    if (error.code === 4902) {
      await provider.send("wallet_addEthereumChain", [
        {
          chainId: ethers.hexlify(chainId),
          rpcUrls: [provider.connection.url],
          chainName: "Custom Network", 
        },
      ]);
      console.log("Added and switched to chain:", chainId);
    } else {
      console.log(
        "Not currently on the correct network. Please switch to the correct network."
      );
    }
  }
};

const connectWallet = async (chainId, rpcUrl) => {
    console.log(chainId, rpcUrl);
  try {
    const provider = await getProvider(rpcUrl);
    console.log("Provider:", provider);

    if (!provider) {
      console.error("No provider available.");
      return null;
    }

    const signer = await getSigner(provider);
    console.log("Signer:", signer);

    if (!signer) {
      console.error("No signer available.");
      return null;
    }

    const walletAddress = await getWalletAddress(signer);
    if (!walletAddress) {
      console.error("No wallet address available.");
      return null;
    }

    if (!(await checkNetwork(provider, chainId))) {
      await switchToChain(provider, chainId);
      if (!(await checkNetwork(provider, chainId))) {
        console.error("Failed to switch to the correct network.");
        return null;
      }
    }

    return { provider, signer, walletAddress };
  } catch (error) {
    console.error("Error while connecting to wallet:", error.message);
    return null;
  }
};


const accountService = {
    connectWallet,
  };
  

export default accountService;