require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const URL_PROVIDER = process.env.URL_PROVIDER;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    mumbai: {
      url: URL_PROVIDER,
      accounts: [PRIVATE_KEY],
    },
  },
};
