# Build a whitelist dApp for your upcoming NFT Collection

![Image](https://i.imgur.com/zgY0TGo.png)

## How to deploy Whitelist contract on Goerli

```batch
# Create .env file
cp .env.example .env
# update .env file with Private Key and Provider URL
vim .env
# compile contract
npx hardhat compile
# deploy on goerli network
npx hardhat run script/deploy.js --network goerli
```

## How to run App in local env

Get the contract address returned from deploy script and add it into `.env` file (duplicate `.env.example` file) inside the `frontend` directory.

Now run `npm install && npm run dev` inside `frontend` directory.
