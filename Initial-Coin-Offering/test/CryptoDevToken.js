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

    // Generate a whitelist user with NFT
    await whitelist.connect(nftOwnerAccount).addAddressToWhitelist()
    await cryptoDevs.connect(owner).startPresale()
    await cryptoDevs.connect(nftOwnerAccount).presaleMint({
      value: ethers.utils.parseEther('0.01')
    })

    return { cryptoDevToken, cryptoDevs, whitelist, owner, otherAccount, nftOwnerAccount }
  }

  describe('Tests', function () {
    it('Should deploy', async function () {
      const { cryptoDevs, cryptoDevToken, whitelist } = await loadFixture(deployFixture)

      expect(cryptoDevs.address).to.be.a('string')
      expect(whitelist.address).to.be.a('string')
      expect(cryptoDevToken.address).to.be.a('string')
    })

    it('Check claim without NFT', async function () {
      const { cryptoDevToken, otherAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevToken.connect(otherAccount).claim()).to.be.revertedWith("You don't own any Crypto Dev NFT")
    })

    it('Check correct claim for NFT owner user', async function () {
      const { cryptoDevToken, nftOwnerAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevToken.connect(nftOwnerAccount).claim()).to.be.not.reverted
    })

    it('Check duplicate claim for NFT owner user', async function () {
      const { cryptoDevToken, nftOwnerAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevToken.connect(nftOwnerAccount).claim()).to.be.not.reverted

      await expect(cryptoDevToken.connect(nftOwnerAccount).claim()).to.be.revertedWith('You have already claimed all the tokens')
    })

    it('Check mint with wrong value', async function () {
      const { cryptoDevToken, otherAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevToken.connect(otherAccount).mint(5, {
        value: ethers.utils.parseEther('0.0009')
      })).to.be.revertedWith('Ether sent is incorrect')
    })

    it('Check mint with bigger amount', async function () {
      const { cryptoDevToken, otherAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevToken.connect(otherAccount).mint(10001, {
        value: ethers.utils.parseEther('10.001')
      })).to.be.revertedWith('Exceeds the max total supply available.')
    })

    it('Check correct mint', async function () {
      const { cryptoDevToken, otherAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevToken.connect(otherAccount).mint(5, {
        value: ethers.utils.parseEther('0.005')
      })).to.be.not.reverted
    })

    it('Check only owner can withdraw', async function () {
      const { cryptoDevToken, otherAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevToken.connect(otherAccount).withdraw()).to.be.revertedWith('Ownable: caller is not the owner')
    })

    it('Check owner withdraw', async function () {
      const { cryptoDevToken, owner, otherAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevToken.connect(otherAccount).mint(5, {
        value: ethers.utils.parseEther('0.005')
      })).to.be.not.reverted

      // Get owner balance before withdraw
      const provider = ethers.provider
      const prevBalance = await provider.getBalance(owner.address)

      await expect(cryptoDevToken.connect(owner).withdraw()).to.be.not.reverted

      // Get owner balance after withdraw
      const postBalance = await provider.getBalance(owner.address)

      // Get different of balances
      const balance = Number(ethers.utils.formatEther(postBalance.sub(prevBalance)))

      // Check if balance is similar to minted price
      expect(balance).to.be.greaterThan(0.004)
      expect(balance).to.be.lessThanOrEqual(0.005)

      // Now there is nothing to withdraw
      await expect(cryptoDevToken.connect(owner).withdraw()).to.be.revertedWith('Nothing to withdraw, contract balance empty')
    })
  })
})
