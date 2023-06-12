# Create an NFT Collection with metadata stored on IPFS

![Image](https://i.imgur.com/3BdOj89.png)

## Requirements

- There should only exist 10 LearnWeb3 Punk NFT's and each one of them should be unique.
- User's should be able to mint only 1 NFT with one transaction.
- The metadata for the NFT's should be stored on IPFS
- There should be a website for your NFT Collection.
- The NFT contract should be deployed on Mumbai testnet

## How to deploy NFT collection on Mumbai

### Assets to download and upload on Pinata or another IPFS pinning service

[NFT Images](https://github.com/LearnWeb3DAO/IPFS-Practical/tree/master/my-app/public/LW3punks)

[NFT Metadata](https://github.com/LearnWeb3DAO/IPFS-Practical/tree/master/my-app/public/metadata)

Download the folders, upload NFT Images, get the CID of the NFT folder, update json metadata with the correct CID folder, and upload them.

Use now metadata CID inside .env file.

```batch
# Create .env file
cp .env.example .env
# update .env file with Private Key, Provider URL, CID_METADATA
vim .env
# compile contract
npx hardhat compile
# deploy on mumbai network
npx hardhat run script/deploy.js --network mumbai
```

## How to run App in local env

Get the contract address returned from deploy script and add it into `.env` file (duplicate `.env.example` file) inside the `frontend` directory.

Now run `npm install && npm run dev` inside `frontend` directory.
