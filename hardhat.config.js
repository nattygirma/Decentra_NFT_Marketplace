// import { PROJECT_ID } from "./utils/constants";

require("@nomiclabs/hardhat-waffle");
const fs = require("fs");

const infuraUrl = process.env.REACT_APP_INFURA_API_URL;
// const privateKey = process.env.REACT_APP_PRIVATE_KEY;


const privateKey =fs.readFileSync(".secret").toString().trim() || "01234567890123456789";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: infuraUrl,
      accounts: [privateKey],
    },
    // mainnet: {
    //   url: `https://polygon-mainnet.infura.io/v3/${PROJECT_ID}`,
    //   accounts: [privateKey],
    // },
  },
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
