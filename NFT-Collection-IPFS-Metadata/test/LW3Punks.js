const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("LW3Punks", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const metadataURL = `ipfs://${process.env.CID_METADATA}`;

    const LW3Punks = await ethers.getContractFactory("LW3Punks");
    const lW3Punks = await LW3Punks.deploy(metadataURL);

    return { lW3Punks, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { lW3Punks, owner } = await loadFixture(deployFixture);

      expect(await lW3Punks.owner()).to.equal(owner.address);
    });
  });
});
