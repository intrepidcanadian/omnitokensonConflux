
<h1 align="center">Deploying Omni Tokens on Conflux eSpace</h1>

By deploying an Omnichain Fungible Token (OFT) on Conflux eSpace, you can transfer your token to supported chains via the LayerZero bridge. This allows the token to start supporting multiple chains without the need to wrap your token or use a middlechain.

The deployment of an OFT token is very simple and can be done in 3 steps. (1) Deployment of the OFT contract on each of the blockchains you want to support which includes the LayerZero Endpoint ID, (2) Configuration of the blockchains you want to connect and defining the pathway between them, (3) Wiring together the pathways specified in (2) to allow the OFT contracts to interoperate across chains.

This repository is an example of how to deploy an OFT token (which is an ERC20 standard) that can be transferred between Conflux eSpace (testnet) and Ethereum (Sepolia).

- [So What is an Omnichain Fungible Token?](#so-what-is-an-omnichain-fungible-token)

<img alt="LayerZero" style="" src="https://docs.layerzero.network/assets/images/oft_mechanism_light-922b88c364b5156e26edc6def94069f1.jpg#gh-light-mode-only"/>

This standard works by combining the LayerZero OApp Contract Standard with the ERC20 [`_burn`](https://github.com/LayerZero-Labs/LayerZero-v2/blob/main/packages/layerzero-v2/evm/oapp/contracts/oft/OFT.sol#L80) method, to initiate omnichain send transfers on the source chain, sending a message via the LayerZero protocol, and delivering a function call to the destination contract to [`_mint`](https://github.com/LayerZero-Labs/LayerZero-v2/blob/main/packages/layerzero-v2/evm/oapp/contracts/oft/OFT.sol#L96) the same number of tokens burned, creating a unified supply across all networks connected.

Read more about what you can do with OFTs by reading the [OFT Quickstart](https://docs.layerzero.network/v2/developers/evm/oft/quickstart) in the LayerZero Documentation.

Instructions: 

```bash
pnpm install
```

```bash
npx hardhat lz:deploy
```

```bash
npx hardhat lz:oapp:config:init --contract-name MyOFT --oapp-config testnet.layerzero.config.ts
```

```bash
npx hardhat lz:oapp:wire --oapp-config testnet.layerzero.config.ts
```

## Testing out frontend

```bash
cd token-transfer
```

```bash
npm run start
```