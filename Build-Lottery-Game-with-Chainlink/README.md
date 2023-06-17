# Build a Lottery Game with Chainlink VRFs

![Image](https://assets-global.website-files.com/5f6b7190899f41fb70882d08/5fa2e0756bd3167ad8cdbf1c_chainlink-open-graph-images_vrf.png)

## Requirements

- We will build a lottery game today
- Each game will have a max number of players and an entry fee
- After max number of players have entered the game, one winner is chosen at random
- The winner will get maxplayers\*entryfee amount of ether for winning the game

## How to deploy contract on Mumbai

```batch
# Create .env file
cp .env.example .env
# update .env file with Private Key, Provider URL
vim .env
# compile contract
npx hardhat compile
# deploy on mumbai network
npx hardhat run script/deploy.js --network mumbai
```

## How to run App in local env

Get the contract address returned from deploy script and add it into `.env` file (duplicate `.env.example` file) inside the `frontend` directory.

Now run `npm install && npm run dev` inside `frontend` directory.
