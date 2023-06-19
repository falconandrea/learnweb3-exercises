# Use merkle tree to verify Whitelist users

Merkle Trees are a fundamental concept in blockchain technology. They're a special kind of binary tree that is used to encode large chunks of information. The cool thing about Merkle Trees is that they kind of 'build up' from the bottom-up and allow you to verify if some value is present in the tree or not without having to loop over every element of the tree.

In Sophomore, we created a Whitelist dApp that stored user addresses in a mapping. While that approach works, storing data in smart contract storage is by far the most expensive thing you can do in terms of gas. So what if you had to store 1000 addresses? What about 10,000, or 100,000?

At that point, utilizing smart contract storage directly is just infeasible and can easily cost millions of dollars just to whitelist people. On the other hand, you could build up a Merkle Tree and just store the Merkle Root value in the contract - a measly bytes32 value. In this scenario, the contract is now the Verifier, and users who wish to use their whitelist spot for minting NFTs, let's say, become the Provers proving that they are indeed part of the whitelist.
Let's see how this would work.

We created:

- Whitelist contract with the checkInWhitelist function
- Simple test to check if an address is inside the Whitelist

```shell
npm install
npx hardhat test
```
