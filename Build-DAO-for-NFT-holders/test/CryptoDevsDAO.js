const {
  time,
  loadFixture
} = require('@nomicfoundation/hardhat-network-helpers')
const { expect } = require('chai')
require('dotenv').config()

describe('CrytpoDevsDAO', function () {
  async function deployFixture () {
    const [owner, otherAccount, nftOwnerAccount] = await ethers.getSigners()

    const Whitelist = await ethers.getContractFactory('Whitelist')
    const whitelist = await Whitelist.deploy(5)

    const CryptoDevs = await ethers.getContractFactory('CryptoDevs')
    const cryptoDevs = await CryptoDevs.deploy('https://link-for-tests.local', whitelist.address)

    const Market = await ethers.getContractFactory('FakeNFTMarketplace')
    const market = await Market.deploy()

    const CryptoDevsDAO = await ethers.getContractFactory('CryptoDevsDAO')
    const cryptoDevsDAO = await CryptoDevsDAO.deploy(market.address, cryptoDevs.address)

    // Generate a whitelist user with NFT
    await whitelist.connect(nftOwnerAccount).addAddressToWhitelist()
    await cryptoDevs.connect(owner).startPresale()
    await cryptoDevs.connect(nftOwnerAccount).presaleMint({
      value: ethers.utils.parseEther('0.01')
    })

    return { cryptoDevsDAO, cryptoDevs, whitelist, owner, otherAccount, nftOwnerAccount }
  }

  describe('Tests', function () {
    it('Should deploy', async function () {
      const { cryptoDevsDAO, cryptoDevs, whitelist } = await loadFixture(deployFixture)

      expect(cryptoDevs.address).to.be.a('string')
      expect(whitelist.address).to.be.a('string')
      expect(cryptoDevsDAO.address).to.be.a('string')
    })

    it('Check create proposal without NFT holder', async function () {
      const { cryptoDevsDAO, otherAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevsDAO.connect(otherAccount).createProposal(0)).to.be.revertedWith("NOT_A_DAO_MEMBER")
    })

    it('Check create proposal with NFT holder', async function () {
      const { cryptoDevsDAO, nftOwnerAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevsDAO.connect(nftOwnerAccount).createProposal(0)).to.be.not.reverted
    })

    it('Check vote on not existing proposal', async function () {
      const { cryptoDevsDAO, nftOwnerAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevsDAO.connect(nftOwnerAccount).voteOnProposal(0, 1)).to.be.revertedWith('DEADLINE_EXCEEDED')
    })

    it('Check vote on active proposal', async function () {
      const { cryptoDevsDAO, nftOwnerAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevsDAO.connect(nftOwnerAccount).createProposal(0)).to.be.not.reverted
      await expect(cryptoDevsDAO.connect(nftOwnerAccount).voteOnProposal(0, 1)).to.be.not.reverted
    })

    it('Check duplicate vote on active proposal', async function () {
      const { cryptoDevsDAO, nftOwnerAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevsDAO.connect(nftOwnerAccount).createProposal(0)).to.be.not.reverted
      await expect(cryptoDevsDAO.connect(nftOwnerAccount).voteOnProposal(0, 1)).to.be.not.reverted

      await expect(cryptoDevsDAO.connect(nftOwnerAccount).voteOnProposal(0, 1)).to.be.revertedWith('ALREADY_VOTED')
    })

    it('Check executing on active proposal', async function () {
      const { cryptoDevsDAO, nftOwnerAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevsDAO.connect(nftOwnerAccount).createProposal(0)).to.be.not.reverted
      await expect(cryptoDevsDAO.connect(nftOwnerAccount).voteOnProposal(0, 1)).to.be.not.reverted

      await expect(cryptoDevsDAO.connect(nftOwnerAccount).executeProposal(0)).to.be.revertedWith('DEADLINE_NOT_EXCEEDED')
    })

    it('Check executing on inactive proposal', async function () {
      const { cryptoDevsDAO, nftOwnerAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevsDAO.connect(nftOwnerAccount).createProposal(0)).to.be.not.reverted
      await expect(cryptoDevsDAO.connect(nftOwnerAccount).voteOnProposal(0, 1)).to.be.not.reverted

      // Move time to proposal deadline
      await time.increase(60 * 10)

      await expect(cryptoDevsDAO.connect(nftOwnerAccount).executeProposal(0)).to.be.not.reverted
    })

    it('Check executing two times on inactive proposal', async function () {
      const { cryptoDevsDAO, nftOwnerAccount } = await loadFixture(deployFixture)

      await expect(cryptoDevsDAO.connect(nftOwnerAccount).createProposal(0)).to.be.not.reverted
      await expect(cryptoDevsDAO.connect(nftOwnerAccount).voteOnProposal(0, 1)).to.be.not.reverted

      // Move time to proposal deadline
      await time.increase(60 * 10)

      await expect(cryptoDevsDAO.connect(nftOwnerAccount).executeProposal(0)).to.be.not.reverted

      await expect(cryptoDevsDAO.connect(nftOwnerAccount).executeProposal(0)).to.be.revertedWith('PROPOSAL_ALREADY_EXECUTED')
    })
  })
})
