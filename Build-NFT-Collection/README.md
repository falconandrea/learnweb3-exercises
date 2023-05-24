# Build an NFT Collection

![Image](https://i.imgur.com/fVxV66f.png)

## Requirements

- There should only exist 20 Crypto Dev NFT's and each one of them should be unique.
- User's should be able to mint only 1 NFT with one transaction.
- Whitelisted users, should have a 5 min presale period before the actual sale where they are guaranteed 1 NFT per transaction.
- There should be a website for your NFT Collection.

## How to deploy NFT Collection contract on Goerli

### You have to deploy before the Whitelist Contract to get the address to put inside the .env file

```batch
# Create .env file
cp .env.example .env
# update .env file with Private Key, Provider URL, Whitelist Address and Metadata URL
vim .env
# compile contract
npx hardhat compile
# deploy on goerli network
npx hardhat run script/deploy.js --network goerli
```

## How to run App in local env

Get the contract address returned from deploy script and add it into `.env` file (duplicate `.env.example` file) inside the `frontend` directory.

Now run `npm install && npm run dev` inside `frontend` directory.
