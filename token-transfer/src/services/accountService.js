import { ethers } from 'ethers';

// Define network parameters at the top of the file
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

// Function to map chainId to network key
const getNetworkKeyByChainId = (chainId) => {
  // Convert chainId to a hex string and ensure it's in lower case
  const chainIdHex = ethers.toBeHex(chainId).toLowerCase(); // Use ethers.toBeHex to handle conversion
  return Object.keys(networkParams).find(
    (key) => networkParams[key].chainId === chainIdHex
  );
};

const getProvider = async () => {
  try {
    if (!window.ethereum) throw new Error('MetaMask is not installed');
    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log('Provider created:', provider);
    return provider;
  } catch (error) {
    console.error('Failed to create provider:', error);
    return null;
  }
};

const getWalletAddress = async (signer) => {
  try {
    return await signer.getAddress();
  } catch (error) {
    console.error('Failed to get wallet address:', error);
    return null;
  }
};

const getSigner = async (provider) => {
  if (!provider) return null;
  try {
    const signer = await provider.getSigner();
    console.log('Signer:', signer);
    return signer;
  } catch (error) {
    console.error('Failed to get signer:', error);
    return null;
  }
};

const checkNetwork = async (provider, chainId) => {
  if (!provider) return false;
  try {
    const network = await provider.getNetwork();
    return network.chainId.toString() === chainId.toString();
  } catch (error) {
    console.error('Failed to check network:', error);
    return false;
  }
};

const switchToChain = async (provider, chain) => {
  const params = networkParams[chain];
  if (!params) {
    console.error('Unsupported chain or networkParams is undefined');
    return false;
  }

  try {
    // Attempt to switch to the network
    await provider.send('wallet_switchEthereumChain', [{ chainId: params.chainId }]);
    console.log('Switched to chain:', params.chainId);
    return true;
  } catch (switchError) {
    // Check if the error is due to the chain not being added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Use params to add the new chain
        await provider.send('wallet_addEthereumChain', [
          {
            chainId: params.chainId,
            rpcUrls: params.rpcUrls,
            chainName: params.chainName,
            nativeCurrency: params.nativeCurrency,
            blockExplorerUrls: params.blockExplorerUrls,
          },
        ]);
        console.log('Added and switched to chain:', params.chainId);
        return true;
      } catch (addError) {
        console.error('Failed to add new chain:', addError);
        return false;
      }
    } else {
      console.error('Failed to switch network:', switchError);
      return false;
    }
  }
};

const connectWallet = async (chainOrId) => {
  try {
    const provider = await getProvider();
    if (!provider) return null;

    const signer = await getSigner(provider);
    if (!signer) return null;

    const walletAddress = await getWalletAddress(signer);
    if (!walletAddress) return null;

    // Determine chain key or get key by chainId
    const chainKey = typeof chainOrId === 'string' ? chainOrId : getNetworkKeyByChainId(chainOrId);

    const params = networkParams[chainKey];
    if (!params) {
      console.error(`Network parameters for ${chainKey || chainOrId} not found.`);
      return null;
    }

    const chainId = parseInt(params.chainId, 16); // Convert hex string to number

    const onCorrectNetwork = await checkNetwork(provider, chainId);
    if (!onCorrectNetwork) {
      const switched = await switchToChain(provider, chainKey); // Pass the chain key
      if (!switched) {
        console.error('Failed to switch to the correct network.');
        return null;
      }
    }

    return { provider, signer, walletAddress };
  } catch (error) {
    console.error('Error while connecting to wallet:', error);
    return null;
  }
};

const accountService = {
  connectWallet,
};

export default accountService;
