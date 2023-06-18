# Build a Lottery Game with Chainlink VRFs and The Graph

![Image](https://i.imgur.com/W14ZveK.png)

## Requirements

- We will build a lottery game today
- Each game will have a max number of players and an entry fee
- After max number of players have entered the game, one winner is chosen at random
- The winner will get maxplayers\*entryfee amount of ether for winning the game
- We use [The Graph](https://thegraph.com/) to get events from the Contract deployed

## How to deploy contract on Mumbai

```batch
# Create .env file
cp .env.example .env
# update .env file with Private Key, Provider URL, and Polygon scan apikey
vim .env
# compile contract
npx hardhat compile
# deploy on mumbai network
npx hardhat run script/deploy.js --network mumbai
```

## How to run App in local env

Get the contract address returned from deploy script and add it into `.env` file (duplicate `.env.example` file) inside the `frontend` directory.

Now run `npm install && npm run dev` inside `frontend` directory.

Inside the `frontend` folder we use inside the `.env` file the access token from [The Graph](https://thegraph.com/).

The folder `graph` is used to deploy the subgraph for my contract. You can use the tutorial [here](https://thegraph.com/docs/en/cookbook/quick-start/) to deploy yours.
