# Build a DAO for your NFT holders

![Image](https://i.imgur.com/6uXR2G9.png)

## Requirements

- Anyone with a CryptoDevs NFT can create a proposal to purchase a different NFT from an NFT marketplace
- Everyone with a CryptoDevs NFT can vote for or against the active proposals
- Each NFT counts as one vote for each proposal
- Voter cannot vote multiple times on the same proposal with the same NFT
- If majority of the voters vote for the proposal by the deadline, the NFT purchase is automatically executed

## How to deploy NFT DAO contract on Goerli

### You have to deploy before the NFT Contract to get the address to put inside the .env file

### Warning: pay attention to your deploy script file at line 29, you must have at least 0.1 eth on your wallet

```batch
# Create .env file
cp .env.example .env
# update .env file with Private Key, Provider URL, NFT Contract Address and Metadata URL
vim .env
# compile contract
npx hardhat compile
# deploy on goerli network
npx hardhat run script/deploy.js --network goerli
```

## How to run App in local env

Get the contract address returned from deploy script and add it into `.env` file (duplicate `.env.example` file) inside the `frontend` directory.

Now run `npm install && npm run dev` inside `frontend` directory.
