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
    // const approveTx = await cryptoDevToken.connect(nftOwnerAccount).approve(exchange.address, 3)
    // await approveTx.wait()
    // await cryptoDevToken.connect(nftOwnerAccount).transfer(exchange.address, 3)

    // await owner.sendTransaction({to: exchange.address, value: ethers.utils.parseEther('0.9')});

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

      // Check balance before
      const balanceBefore = await cryptoDevToken.connect(nftOwnerAccount).balanceOf(nftOwnerAccount.address)

      await expect(exchange.connect(nftOwnerAccount).addLiquidity(1, {
        value: ethers.utils.parseEther('0.5')
      })).to.be.not.reverted

      // Check balance after
      const balanceAfter = await cryptoDevToken.connect(nftOwnerAccount).balanceOf(nftOwnerAccount.address)

      expect(balanceBefore).to.be.greaterThan(balanceAfter)
    })

    it('Check add liquidity with amount required too high', async function () {
      const { exchange, nftOwnerAccount, cryptoDevToken } = await loadFixture(deployFixture)

      // Check balance before
      const balanceBefore = await cryptoDevToken.connect(nftOwnerAccount).balanceOf(nftOwnerAccount.address)

      // Approve transfer token
      const approveTx = await cryptoDevToken.connect(nftOwnerAccount).approve(exchange.address, 1)
      await approveTx.wait()

      await expect(exchange.connect(nftOwnerAccount).addLiquidity(1, {
        value: ethers.utils.parseEther('0.5')
      })).to.be.not.reverted

      // Check balance after
      const balanceAfter = await cryptoDevToken.connect(nftOwnerAccount).balanceOf(nftOwnerAccount.address)

      expect(balanceBefore).to.be.greaterThan(balanceAfter)

      // Try to add more liquidity
      await expect(exchange.connect(nftOwnerAccount).addLiquidity(1, {
        value: ethers.utils.parseEther('1')
      })).to.be.revertedWith('Amount of tokens sent is less than the minimum tokens required')
    })

    it('Check remove liquidity from a user without token', async function () {
      const { exchange, otherAccount, cryptoDevToken } = await loadFixture(deployFixture)

      await expect(exchange.connect(otherAccount).removeLiquidity(1)).to.be.revertedWith("You have not enough tokens")
    })

    it('Check remove liquidity with amount equal to 0', async function () {
      const { exchange, nftOwnerAccount, cryptoDevToken } = await loadFixture(deployFixture)

      await expect(exchange.connect(nftOwnerAccount).removeLiquidity(0)).to.be.revertedWith("_amount should be greater than zero")
    })

    it('Check remove liquidity with tokens', async function () {
      const { exchange, nftOwnerAccount, otherAccount, cryptoDevToken } = await loadFixture(deployFixture)

      // Approve transfer token
      const approveTx = await cryptoDevToken.connect(nftOwnerAccount).approve(exchange.address, 1)
      await approveTx.wait()

      await expect(exchange.connect(nftOwnerAccount).addLiquidity(1, {
        value: ethers.utils.parseEther('0.5')
      })).to.be.not.reverted

      await expect(exchange.connect(nftOwnerAccount).removeLiquidity(1)).to.be.not.reverted
    })

    it('Check swap eth to tokens with lower amount', async function () {
      const { exchange, nftOwnerAccount, otherAccount, cryptoDevToken } = await loadFixture(deployFixture)

      // Approve transfer token
      const approveTx = await cryptoDevToken.connect(nftOwnerAccount).approve(exchange.address, 2)
      await approveTx.wait()

      await expect(exchange.connect(nftOwnerAccount).addLiquidity(2, {
        value: ethers.utils.parseEther('1')
      })).to.be.not.reverted

      await expect(exchange.connect(nftOwnerAccount).ethToCryptoDevToken(1, {
        value: ethers.utils.parseEther('0.5')
      })).to.be.revertedWith('insufficient output amount')
    })

    it('Check swap eth to tokens', async function () {
      const { exchange, nftOwnerAccount, otherAccount, cryptoDevToken } = await loadFixture(deployFixture)

      // Approve transfer token
      const approveTx = await cryptoDevToken.connect(nftOwnerAccount).approve(exchange.address, 2)
      await approveTx.wait()

      await expect(exchange.connect(nftOwnerAccount).addLiquidity(2, {
        value: ethers.utils.parseEther('1')
      })).to.be.not.reverted

      await expect(exchange.connect(nftOwnerAccount).ethToCryptoDevToken(1, {
        value: ethers.utils.parseEther('1.5')
      })).to.be.not.reverted
    })

    it('Check swap tokens to eth with higher amount output', async function () {
      const { exchange, nftOwnerAccount, otherAccount, cryptoDevToken } = await loadFixture(deployFixture)

      // Approve transfer token
      const approveTx = await cryptoDevToken.connect(nftOwnerAccount).approve(exchange.address, 2)
      await approveTx.wait()

      await expect(exchange.connect(nftOwnerAccount).addLiquidity(2, {
        value: ethers.utils.parseEther('1')
      })).to.be.not.reverted

      // Approve transfer token
      const approveTx2 = await cryptoDevToken.connect(nftOwnerAccount).approve(exchange.address, 1)
      await approveTx2.wait()

      await expect(exchange.connect(nftOwnerAccount).cryptoDevTokenToEth(1, ethers.utils.parseEther('5'))).to.be.revertedWith('insufficient output amount')
    })

    it('Check swap tokens to eth', async function () {
      const { exchange, nftOwnerAccount, otherAccount, cryptoDevToken } = await loadFixture(deployFixture)

      // Approve transfer token
      const approveTx = await cryptoDevToken.connect(nftOwnerAccount).approve(exchange.address, 2)
      await approveTx.wait()

      await expect(exchange.connect(nftOwnerAccount).addLiquidity(2, {
        value: ethers.utils.parseEther('1')
      })).to.be.not.reverted

      // Approve transfer token
      const approveTx2 = await cryptoDevToken.connect(nftOwnerAccount).approve(exchange.address, 1)
      await approveTx2.wait()

      await expect(exchange.connect(nftOwnerAccount).cryptoDevTokenToEth(1,ethers.utils.parseEther('0.3'))).to.be.not.reverted
    })
  })
})
