const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs")
const { expect } = require("chai")
require('dotenv').config()

describe("LW3Punks", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners()

    const metadataURL = `ipfs://${process.env.CID_METADATA}`

    const lw3PunksContract = await ethers.getContractFactory("LW3Punks")
    const deployedLW3PunksContract = await lw3PunksContract.deploy(metadataURL)

    await deployedLW3PunksContract.deployed()

    return { deployedLW3PunksContract, owner, otherAccount }
  }

  describe("Deployment", function () {
    it('Should deploy', async function () {
      const { deployedLW3PunksContract } = await loadFixture(deployFixture)

      expect(deployedLW3PunksContract.address).to.be.a('string')
    })

    it("Should set the right owner", async function () {
      const { deployedLW3PunksContract, owner } = await loadFixture(deployFixture)

      expect(await deployedLW3PunksContract.owner()).to.equal(owner.address)
    })
  })

  describe("Mint", function () {
    it('Should block mint when contract is paused', async function () {
      const { deployedLW3PunksContract, owner, otherAccount } = await loadFixture(deployFixture)

      await expect(deployedLW3PunksContract.connect(otherAccount).setPaused(1)).revertedWith(
        'Ownable: caller is not the owner'
      )

      await expect(deployedLW3PunksContract.connect(owner).setPaused(1)).to.be.not.reverted

      await expect(deployedLW3PunksContract.connect(otherAccount).mint({value: ethers.utils.parseEther('0.01')})).to.revertedWith(
        'Contract currently paused'
      )
    })

    it("Should block mint if eth amount is wrong", async function () {
      const { deployedLW3PunksContract } = await loadFixture(deployFixture)

      await expect(deployedLW3PunksContract.mint({value: ethers.utils.parseEther('0.009')})).to.revertedWith(
        'Ether sent is not correct'
      )
    })

    it("Should block mint if nft amount is reached", async function () {
      const { deployedLW3PunksContract } = await loadFixture(deployFixture)

      const maxTokenIds = (await deployedLW3PunksContract.maxTokenIds()).toString()

      for(let i = 0; i < maxTokenIds; i++) {
        await deployedLW3PunksContract.mint({value: ethers.utils.parseEther('0.01')})
      }

      await expect(deployedLW3PunksContract.mint({value: ethers.utils.parseEther('0.01')})).to.revertedWith(
        'Exceed maximum LW3Punks supply'
      )
    })

    it("Should mint correctly", async function () {
      const { deployedLW3PunksContract, owner } = await loadFixture(deployFixture)

      await expect(deployedLW3PunksContract.connect(owner).mint({value: ethers.utils.parseEther('0.01')})).to.be.not.reverted

      const balance = await deployedLW3PunksContract.connect(owner).balanceOf(owner.address)
      expect(balance.toString()).to.be.equal('1')
    })
  })

  describe("Other functions", function () {
    it("Should give error if tokenURI receive wrong token id", async function () {
      const { deployedLW3PunksContract } = await loadFixture(deployFixture)

      await expect(deployedLW3PunksContract.tokenURI(12)).to.be.revertedWith(
        'ERC721Metadata: URI query for nonexistent token'
      )
    })
  })

  describe("Withdraw", function () {
    it("Should revert with the right error if called from another account", async function () {
      const { deployedLW3PunksContract, otherAccount } = await loadFixture(
        deployFixture
      )

      // We use deployedLW3PunksContract.connect() to send a transaction from another account
      await expect(deployedLW3PunksContract.connect(otherAccount).withdraw()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      )
    })

    it("Shouldn't fail if the owner calls it", async function () {
      const { deployedLW3PunksContract, owner } = await loadFixture(
        deployFixture
      )

      await expect(deployedLW3PunksContract.connect(owner).withdraw()).not.to.be.reverted
    })
  })
})
