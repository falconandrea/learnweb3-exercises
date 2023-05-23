const {
  time,
  loadFixture
} = require('@nomicfoundation/hardhat-network-helpers')
const { expect } = require('chai')
require('dotenv').config()

describe('CryptoDevs', function () {
  async function deployFixture () {
    const [owner, otherAccount] = await ethers.getSigners()

    const Whitelist = await ethers.getContractFactory('Whitelist')
    const whitelist = await Whitelist.deploy(5)

    const CryptoDevs = await ethers.getContractFactory('CryptoDevs')
    const cryptoDevs = await CryptoDevs.deploy(process.env.METADATA_URL, whitelist.address)

    return { cryptoDevs, whitelist, owner, otherAccount }
  }

  describe('Tests', function () {
    it('Should deploy', async function () {
      const { cryptoDevs, whitelist } = await loadFixture(deployFixture)

      expect(cryptoDevs.address).to.be.a('string')
      expect(whitelist.address).to.be.a('string')
    })

    it('Check mint outside presale time', async function () {
      const { cryptoDevs, owner } = await loadFixture(deployFixture)

      await expect(cryptoDevs.connect(owner).presaleMint()).to.be.revertedWith('Presale is not running')
    })

    it('Check premint with user not in whitelist', async function () {
      const { whitelist, cryptoDevs, owner } = await loadFixture(deployFixture)

      // Check user not in whitelist
      await expect(whitelist.connect(owner).whitelistedAddresses[owner.address]).to.be.undefined

      // Start presale
      await expect(cryptoDevs.connect(owner).startPresale()).to.be.not.reverted

      // Try to mint
      await expect(cryptoDevs.connect(owner).presaleMint()).to.be.revertedWith('You are not whitelisted')
    })

    it('Check premint with wrong value', async function () {
      const { whitelist, cryptoDevs, owner } = await loadFixture(deployFixture)

      // Add users to whitelist
      await expect(whitelist.connect(owner).addAddressToWhitelist()).to.be.not.reverted

      // Check users in whitelist
      await expect(await whitelist.connect(owner).whitelistedAddresses(owner.address)).to.be.equal(true)

      // Start presale
      await expect(cryptoDevs.connect(owner).startPresale()).to.be.not.reverted

      // Mint first NFT
      await expect(cryptoDevs.connect(owner).presaleMint({
        value: ethers.utils.parseEther('0.009')
      })).to.be.revertedWith('Ether sent is not correct')
    })

    it('Check updates on total supply', async function () {
      const { whitelist, cryptoDevs, owner } = await loadFixture(deployFixture)

      // Add users to whitelist
      await expect(whitelist.connect(owner).addAddressToWhitelist()).to.be.not.reverted

      // Check users in whitelist
      await expect(await whitelist.connect(owner).whitelistedAddresses(owner.address)).to.be.equal(true)

      // Start presale
      await expect(cryptoDevs.connect(owner).startPresale()).to.be.not.reverted

      // Cannot set total supply = 0
      await expect(cryptoDevs.connect(owner).updateTotalSupply(0)).to.be.revertedWith('New value must be greater than 0')

      // Mint first NFT
      await expect(cryptoDevs.connect(owner).presaleMint({
        value: ethers.utils.parseEther('0.01')
      })).to.be.not.reverted

      // Cannot set total supply < total of NFTs minted
      await expect(cryptoDevs.connect(owner).updateTotalSupply(1)).to.be.revertedWith('New value must be greater than the number of NFTs already minted')
    })

    it('Check premint over total supply', async function () {
      const { whitelist, cryptoDevs, owner, otherAccount } = await loadFixture(deployFixture)

      // Add users to whitelist
      await expect(whitelist.connect(owner).addAddressToWhitelist()).to.be.not.reverted
      await expect(whitelist.connect(otherAccount).addAddressToWhitelist()).to.be.not.reverted

      // Check users in whitelist
      await expect(await whitelist.connect(owner).whitelistedAddresses(owner.address)).to.be.equal(true)
      await expect(await whitelist.connect(owner).whitelistedAddresses(otherAccount.address)).to.be.equal(true)

      // Start presale
      await expect(cryptoDevs.connect(owner).startPresale()).to.be.not.reverted

      // Change total supply to 1
      await expect(cryptoDevs.connect(owner).updateTotalSupply(1)).to.be.not.reverted

      // Mint first NFT
      await expect(cryptoDevs.connect(owner).presaleMint({
        value: ethers.utils.parseEther('0.01')
      })).to.be.not.reverted

      // Block second mint
      await expect(cryptoDevs.connect(otherAccount).presaleMint({
        value: ethers.utils.parseEther('0.01')
      })).to.be.revertedWith('Exceeded maximum Crypto Devs supply')
    })

    it('Check mint before stopped premint', async function () {
      const { cryptoDevs, owner } = await loadFixture(deployFixture)

      // Start presale
      await expect(cryptoDevs.connect(owner).startPresale()).to.be.not.reverted

      // Mint first NFT
      await expect(cryptoDevs.connect(owner).mint({
        value: ethers.utils.parseEther('0.01')
      })).to.be.revertedWith('Presale has not ended yet')
    })

    it('Check public mint', async function () {
      const { cryptoDevs, owner } = await loadFixture(deployFixture)

      // Start presale
      await expect(cryptoDevs.connect(owner).startPresale()).to.be.not.reverted

      // Move time outside the presale
      await time.increase(60 * 10)

      // Mint first NFT
      await expect(cryptoDevs.connect(owner).mint({
        value: ethers.utils.parseEther('0.01')
      })).to.be.not.reverted
    })
  })
})
