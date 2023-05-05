const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Whitelist", function () {
  async function deployFixture() {
    const [owner, otherAccount, otherAccount2, otherAccount3] = await ethers.getSigners();
    const maxWhitelistAddresses = 3

    const Whitelist = await ethers.getContractFactory("Whitelist");
    const whitelist = await Whitelist.deploy(maxWhitelistAddresses);

    return { whitelist, owner, otherAccount, otherAccount2, otherAccount3 };
  }

  describe("Tests", function () {
    it("Should deploy", async function () {
      const { whitelist } = await loadFixture(deployFixture);

      expect(whitelist.address).to.be.a('string')
    })

    it('Should add my address to the whitelist only 1 time', async function () {
      const { whitelist, owner } = await loadFixture(deployFixture);

      await expect(whitelist.connect(owner).addAddressToWhitelist()).to.be.not.reverted

      await expect(whitelist.connect(owner).addAddressToWhitelist()).to.be.revertedWith('Sender has already been whitelisted')
    })

    it('Should accept only N addresses', async function () {
      const { whitelist, owner, otherAccount, otherAccount2, otherAccount3 } = await loadFixture(deployFixture);

      await expect(whitelist.connect(owner).addAddressToWhitelist()).to.be.not.reverted
      await expect(whitelist.connect(otherAccount).addAddressToWhitelist()).to.be.not.reverted
      await expect(whitelist.connect(otherAccount2).addAddressToWhitelist()).to.be.not.reverted

      await expect(whitelist.connect(otherAccount3).addAddressToWhitelist()).to.be.revertedWith('More addresses cant be added, limit reached')
    })
  })
})
