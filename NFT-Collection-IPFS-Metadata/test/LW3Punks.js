const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers")
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

      console.log('contract', deployedLW3PunksContract.address)

      expect(deployedLW3PunksContract.address).to.be.a('string')
    })
    /*

    it("Should set the right owner", async function () {
      const { deployedLW3PunksContract, owner } = await loadFixture(deployFixture)

      expect(await deployedLW3PunksContract.owner()).to.equal(owner.address)
    })
    */
  })
})
