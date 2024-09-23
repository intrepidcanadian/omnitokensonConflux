import { EndpointId } from '@layerzerolabs/lz-definitions'
const conflux_testnetContract = {
    eid: EndpointId.CONFLUX_V2_TESTNET,
    contractName: 'MyOFT',
}
const sepolia_testnetContract = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'MyOFT',
}
export default {
    contracts: [{ contract: conflux_testnetContract }, { contract: sepolia_testnetContract }],
    connections: [
        {
            from: conflux_testnetContract,
            to: sepolia_testnetContract,
            config: {
                sendLibrary: '0x9325bE62062a8844839C0fF9cbb0bA97b2d9EAF9',
                receiveLibraryConfig: { receiveLibrary: '0x99710d5cd4650A0E6b34438d0bD860F5A426EFd6', gracePeriod: 0 },
                sendConfig: {
                    executorConfig: { maxMessageSize: 10000, executor: '0xE699078689c771383C8e262DCFeE520c9171ED53' },
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0x62A731f0840d23970D5Ec36fb7A586E1d61dB9B6'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
                receiveConfig: {
                    ulnConfig: {
                        confirmations: 2,
                        requiredDVNs: ['0x62A731f0840d23970D5Ec36fb7A586E1d61dB9B6'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
            },
        },
        {
            from: sepolia_testnetContract,
            to: conflux_testnetContract,
            config: {
                sendLibrary: '0xcc1ae8Cf5D3904Cef3360A9532B477529b177cCE',
                receiveLibraryConfig: { receiveLibrary: '0xdAf00F5eE2158dD58E0d3857851c432E34A3A851', gracePeriod: 0 },
                sendConfig: {
                    executorConfig: { maxMessageSize: 10000, executor: '0x718B92b5CB0a5552039B593faF724D182A881eDA' },
                    ulnConfig: {
                        confirmations: 2,
                        requiredDVNs: ['0x8eebf8b423B73bFCa51a1Db4B7354AA0bFCA9193'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
                receiveConfig: {
                    ulnConfig: {
                        confirmations: 1,
                        requiredDVNs: ['0x8eebf8b423B73bFCa51a1Db4B7354AA0bFCA9193'],
                        optionalDVNs: [],
                        optionalDVNThreshold: 0,
                    },
                },
            },
        },
    ],
}
