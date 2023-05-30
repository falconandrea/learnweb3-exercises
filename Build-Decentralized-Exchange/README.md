# Build a Decentralized Exchange

![Image](https://i.imgur.com/nvLT06K.png)

## Requirements

- Build an exchange with only one asset pair (Eth / Crypto Dev)
- Your Decentralized Exchange should take a fee of 1% on swaps
- When user adds liquidity, they should be given Crypto Dev LP tokens (Liquidity Provider tokens)
- CD LP tokens should be given proportional to the Ether user is willing to add to the liquidity

## How to deploy NFT Decentralized Exchange contract on Goerli

### You have to deploy before the Coin contract to get the address to put inside the .env file

```batch
# Create .env file
cp .env.example .env
# update .env file with Private Key, Provider URL, Coin Contract Address
vim .env
# compile contract
npx hardhat compile
# deploy on goerli network
npx hardhat run script/deploy.js --network goerli
```

## How to run App in local env

Get the contract address returned from deploy script and add it into `.env` file (duplicate `.env.example` file) inside the `frontend` directory.

Now run `npm install && npm run dev` inside `frontend` directory.
