# Launch your own Initial Coin Offering

![Image](https://i.imgur.com/78uY3Mm.png)

## Requirements

- There should be a max of 10,000 CD tokens.
- Every Crypto Dev NFT holder should get 10 tokens for free but they would have to pay the gas fees.
- The price of one CD at the time of ICO should be 0.001 ether.
- There should be a website that users can visit for the ICO.

## How to deploy Coint contract on Goerli

### You have to deploy before the NFT Contract to get the address to put inside the .env file

```batch
# Create .env file
cp .env.example .env
# update .env file with Private Key and Provider URL and NFT Contract address
vim .env
# compile contract
npx hardhat compile
# deploy on goerli network
npx hardhat run script/deploy.js --network goerli
```

## How to run App in local env

Get the contract address returned from deploy script and add it into `.env` file (duplicate `.env.example` file) inside the `frontend` directory.

Now run `npm install && npm run dev` inside `frontend` directory.
