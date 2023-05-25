const {
  time,
  loadFixture
} = require('@nomicfoundation/hardhat-network-helpers')
const { expect } = require('chai')
require('dotenv').config()

describe('CryptoDevToken', function () {
  async function deployFixture () {
    const [owner, otherAccount] = await ethers.getSigners()

    const Whitelist = await ethers.getContractFactory('Whitelist')
    const whitelist = await Whitelist.deploy(5)

    const CryptoDevs = await ethers.getContractFactory('CryptoDevs')
    const cryptoDevs = await CryptoDevs.deploy('https://link-for-tests.local', whitelist.address)

    const CryptoDevToken = await ethers.getContractFactory('CryptoDevToken')
    const cryptoDevToken = await CryptoDevToken.deploy(cryptoDevs.address)

    return { cryptoDevToken, cryptoDevs, whitelist, owner, otherAccount }
  }

  describe('Tests', function () {
    it('Should deploy', async function () {
      const { cryptoDevs, cryptoDevToken, whitelist } = await loadFixture(deployFixture)

      expect(cryptoDevs.address).to.be.a('string')
      expect(whitelist.address).to.be.a('string')
      expect(cryptoDevToken.address).to.be.a('string')
    })
  })
})
