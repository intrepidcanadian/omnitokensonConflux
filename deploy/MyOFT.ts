import assert from 'assert'
import { ethers } from 'ethers'

import { type DeployFunction } from 'hardhat-deploy/types'
import { endpointAddresses } from './endpointAddresses'

const contractName = 'MyOFT'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments, network } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    // This is an external deployment pulled in from @layerzerolabs/lz-evm-sdk-v2
    //
    // @layerzerolabs/toolbox-hardhat takes care of plugging in the external deployments
    // from @layerzerolabs packages based on the configuration in your hardhat config
    //
    // For this to work correctly, your network config must define an eid property
    // set to `EndpointId` as defined in @layerzerolabs/lz-definitions
    //
    // For example:
    //
    // networks: {
    //   fuji: {
    //     ...
    //     eid: EndpointId.AVALANCHE_V2_TESTNET
    //   }
    // // }
    // const eid = network.config.eid;
    // const endpointV2Deployment = await hre.deployments.get(`EndpointV2_${eid}`);
    // assert(endpointV2Deployment, `Missing EndpointV2 deployment for eid: ${eid}`);

    // const endpointV2Deployment = await hre.deployments.get('EndpointV2')
    const eid = network.config.eid as number
    console.log(eid);
    const endpointAddress = endpointAddresses[eid]
    console.log(`Using Endpoint Address: ${endpointAddress}`)

    const endpointV2Deployment = await hre.deployments.get('EndpointV2')
    console.log("this is the endpoint address", endpointV2Deployment.address);

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            'ETHSingapore', // name
            'SIG', // symbol
            // endpointV2Deployment.address, // LayerZero's EndpointV2 address 
            // endpointAddress,
            endpointAddress,
            deployer, // owner
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(
        `Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}, endpoint: ${endpointV2Deployment.address}`
    )
    const myOFTContract = await hre.ethers.getContractAt(contractName, address);

    // Mint tokens to the deployer
    const mintAmount = ethers.utils.parseUnits("1000", 18); // Mint 1000 tokens
    await myOFTContract.mint(mintAmount); // Only callable by the contract owner
    console.log(`Minted ${mintAmount.toString()} tokens to ${deployer}`);
}

deploy.tags = [contractName]

export default deploy
