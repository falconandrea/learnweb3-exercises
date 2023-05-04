# LearnWeb3 Exercises

Exercise on [LearnWeb3 Website](https://learnweb3.io/)

## Build a whitelist dApp for your upcoming NFT Collection

![asd](https://i.imgur.com/zgY0TGo.png)

### How to deploy Whitelist contract on Goerli

```batch
# Create .env file
cp .env.example .env
# update .env file with Private Key and Provider URL
vim .env
# compile contract
npx hardhat compile
# deploy on goerli network
npx hardhat run script/deploy.js --network goerli
# get the contract address and add it into .env file
vim .env
```
