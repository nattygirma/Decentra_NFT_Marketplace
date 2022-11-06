// import { PROJECT_ID } from "./utils/constants";

require("@nomiclabs/hardhat-waffle");
// const fs = require("fs");

// const privateKey =
//   fs.readFileSync(".secret").toString().trim() || "01234567890123456789";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/e302ec24bdea44b3991eee0c5b9c3e9e`,
      accounts: [
        "ff8841aef33049b7dcec59b4c4b3d7bd83238fe58f15bb3a1e2160c1d67c134b",
      ],
    },
    // mainnet: {
    //   url: `https://polygon-mainnet.infura.io/v3/${PROJECT_ID}`,
    //   accounts: [privateKey],
    // },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
