const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')
const { expect } = require('chai')
const hre = require('hardhat')
require('dotenv').config()

const { FEE, VRF_COORDINATOR, LINK_TOKEN, KEY_HASH } = require("../constants");

describe('Tests', function () {
  async function deployFixture () {
    const [owner, otherAccount] = await hre.ethers.getSigners()

    const RandomWinnerGame = await hre.ethers.getContractFactory('RandomWinnerGame')
    const randomWinnerGame = await RandomWinnerGame.deploy(VRF_COORDINATOR, LINK_TOKEN, KEY_HASH, FEE)

    await randomWinnerGame.waitForDeployment()

    return { randomWinnerGame, owner, otherAccount }
  }

  describe('Deploy', function () {
    it('Should deploy', async function () {
      const { randomWinnerGame } = await loadFixture(deployFixture)

      expect(randomWinnerGame.target).to.be.a('string')
    })
  })

  describe('Start game', function () {
    it('Should revert start game for no-owner user', async function () {
      const { randomWinnerGame, otherAccount } = await loadFixture(deployFixture)

      await expect(randomWinnerGame.connect(otherAccount).startGame(5, hre.ethers.parseEther('0.001')))
        .to.be.revertedWith('Ownable: caller is not the owner')
    })

    it('Should revert start game without max players limit', async function () {
      const { randomWinnerGame, owner } = await loadFixture(deployFixture)

      await expect(randomWinnerGame.connect(owner).startGame(0, hre.ethers.parseEther('0.001')))
        .to.be.revertedWith('You cannot create a game with max players limit equal 0')
    })

    it('Should start game for owner and emit event', async function () {
      const { randomWinnerGame, owner } = await loadFixture(deployFixture)

      expect(await randomWinnerGame.gameStarted()).to.be.false

      const startGame = await randomWinnerGame.connect(owner).startGame(5, hre.ethers.parseEther('0.001'))
      expect(startGame).to.be.not.reverted
      expect(startGame).to.emit(randomWinnerGame, 'GameStarted')
        .withArgs(1, 5, hre.ethers.parseEther('0.001'))

      expect(await randomWinnerGame.gameStarted()).to.be.true
    })

    it('Should start game only 1 time', async function () {
      const { randomWinnerGame, owner } = await loadFixture(deployFixture)

      await expect(randomWinnerGame.connect(owner).startGame(5, hre.ethers.parseEther('0.001')))
        .to.be.not.reverted

      await expect(randomWinnerGame.connect(owner).startGame(5, hre.ethers.parseEther('0.001')))
        .to.be.revertedWith('Game is currently running')
    })
  })

  describe('Join game', function () {
    it('Should revert join game if the game is not started', async function () {
      const { randomWinnerGame, otherAccount } = await loadFixture(deployFixture)

      await expect(randomWinnerGame.connect(otherAccount).joinGame({
        value: hre.ethers.parseEther('0.001')
      }))
        .to.be.revertedWith('Game has not been started yet')
    })

    it('Should revert join game if value sent is not equal to entryFee', async function () {
      const { randomWinnerGame, owner, otherAccount } = await loadFixture(deployFixture)

      await expect(randomWinnerGame.connect(owner).startGame(5, hre.ethers.parseEther('0.002')))
        .to.be.not.reverted

      await expect(randomWinnerGame.connect(otherAccount).joinGame({
        value: hre.ethers.parseEther('0.001')
      }))
        .to.be.revertedWith('Value sent is not equal to entryFee')
    })

        /*
    it('Should revert join game if game is full', async function () {
      const { randomWinnerGame, owner, otherAccount } = await loadFixture(deployFixture)

      await expect(randomWinnerGame.connect(owner).startGame(1, 10))
        .to.be.not.reverted

      console.log(await randomWinnerGame.connect(owner).getRandomWinner())

      await expect(randomWinnerGame.connect(otherAccount).joinGame({
        value: hre.ethers.parseEther('0.001')
      }))
        .to.be.not.reverted

      await expect(randomWinnerGame.connect(otherAccount).joinGame({
        value: hre.ethers.parseEther('0.001')
      }))
        .to.be.revertedWith('Game is full')
    })

    it('Should join game and emit event', async function () {
      const { randomWinnerGame, owner, otherAccount } = await loadFixture(deployFixture)

      await expect(randomWinnerGame.connect(owner).startGame(1, hre.ethers.parseEther('0.001')))
        .to.be.not.reverted

      const joinGame = await randomWinnerGame.connect(otherAccount).joinGame({
        value: hre.ethers.parseEther('0.001')
      })

      expect(joinGame).to.be.not.reverted
      expect(joinGame).to.emit(randomWinnerGame, 'PlayerJoined')
      .withArgs(1, otherAccount.address)
    })
    */
  })
})
