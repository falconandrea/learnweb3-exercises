require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const URL_PROVIDER = process.env.URL_PROVIDER;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  networks: {
    goerli: {
      url: URL_PROVIDER,
      accounts: [PRIVATE_KEY],
    },
  },
};
