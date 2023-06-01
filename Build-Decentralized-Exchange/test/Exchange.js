const {
  time,
  loadFixture
} = require('@nomicfoundation/hardhat-network-helpers')
const { expect } = require('chai')
require('dotenv').config()

describe('CryptoDevToken', function () {
  async function deployFixture () {
    const [owner, otherAccount, nftOwnerAccount] = await ethers.getSigners()

    const Whitelist = await ethers.getContractFactory('Whitelist')
    const whitelist = await Whitelist.deploy(5)

    const CryptoDevs = await ethers.getContractFactory('CryptoDevs')
    const cryptoDevs = await CryptoDevs.deploy('https://link-for-tests.local', whitelist.address)

    const CryptoDevToken = await ethers.getContractFactory('CryptoDevToken')
    const cryptoDevToken = await CryptoDevToken.deploy(cryptoDevs.address)

    // Generate a whitelist user with NFT and with tokens
    await whitelist.connect(nftOwnerAccount).addAddressToWhitelist()
    await cryptoDevs.connect(owner).startPresale()
    // Mint NFT
    await cryptoDevs.connect(nftOwnerAccount).presaleMint({
      value: ethers.utils.parseEther('0.01')
    })
    // Claim tokens
    await cryptoDevToken.connect(nftOwnerAccount).claim()
    // And mint some tokens
    await cryptoDevToken.connect(nftOwnerAccount).mint(3, {
      value: ethers.utils.parseEther('0.003')
    })

    const Exchange = await ethers.getContractFactory('Exchange')
    const exchange = await Exchange.deploy(cryptoDevToken.address)

    // Transfer some tokens
    const approveTx = await cryptoDevToken.connect(nftOwnerAccount).approve(exchange.address, 3)
    await approveTx.wait()
    await cryptoDevToken.connect(nftOwnerAccount).transfer(exchange.address, 3)

    return { exchange, cryptoDevToken, cryptoDevs, whitelist, owner, otherAccount, nftOwnerAccount }
  }

  describe('Tests', function () {
    it('Should deploy', async function () {
      const { exchange, cryptoDevs, cryptoDevToken, whitelist } = await loadFixture(deployFixture)

      expect(cryptoDevs.address).to.be.a('string')
      expect(whitelist.address).to.be.a('string')
      expect(cryptoDevToken.address).to.be.a('string')
      expect(exchange.address).to.be.a('string')
    })

    it('Check address inside constructor', async function () {
      const { cryptoDevToken } = await loadFixture(deployFixture)

      const Exchange = await ethers.getContractFactory('Exchange')
      await expect(Exchange.deploy(ethers.constants.AddressZero)).to.be.revertedWith('Token address passed is a null address')
    })

    it('Check add liquidity without tokens', async function () {
      const { exchange, otherAccount, cryptoDevToken } = await loadFixture(deployFixture)

      // Approve transfer token
      const approveTx = await cryptoDevToken.connect(otherAccount).approve(exchange.address, 1)
      await approveTx.wait()

      // Add liquidity
      await expect(exchange.connect(otherAccount).addLiquidity(1, {
        value: ethers.utils.parseEther('0.5')
      })).to.be.revertedWith('You have not enough tokens')
    })

    it('Check add liquidity with tokens', async function () {
      const { exchange, nftOwnerAccount, cryptoDevToken } = await loadFixture(deployFixture)

      // Approve transfer token
      const approveTx = await cryptoDevToken.connect(nftOwnerAccount).approve(exchange.address, 1)
      await approveTx.wait()

      await expect(exchange.connect(nftOwnerAccount).addLiquidity(1, {
        value: ethers.utils.parseEther('0.5')
      })).to.be.not.reverted
    })
  })
})
