require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.4",
  networks: {
    goerli: {
      url: process.env.URL_PROVIDER,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
