const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const hre = require("hardhat");

describe("Reentrancy", function () {
  let bank;
  let attack;
  beforeEach(async function () {
    const Logger = await hre.ethers.getContractFactory("Logger");
    const logger = await Logger.deploy();
    await logger.deployed();

    const Bank = await hre.ethers.getContractFactory("Bank");
    bank = await Bank.deploy(logger.address);
    await bank.deployed();

    const Attack = await hre.ethers.getContractFactory("Attack");
    attack = await Attack.deploy(bank.address);
    await attack.deployed();

    // initial deposit
    const accounts = await hre.ethers.getSigners();
    await bank.deposit({
      from: accounts[0].address,
      value: ethers.utils.parseEther("15.0"),
    });
    await attack.deposit({
      from: accounts[0].address,
      value: ethers.utils.parseEther("8.0"),
    });
  });

  it("Normal withdraw function should work", async function () {
    const initialBankBalance = await bank.getBalance();
    await bank.withdraw(ethers.utils.parseEther("1.0"));
    const currentBankBalance = await bank.getBalance();
    const withdrawnBalance = initialBankBalance - currentBankBalance;

    expect(withdrawnBalance.toString()).to.equal(
      ethers.utils.parseEther("1").toString()
    );
  });

  it("Should attack reentrancy success", async function () {
    const initialBankBalance = await bank.getBalance();
    const initialAttackerBalance = await attack.getBalance();
    try {
      await attack.attack();
    } catch (err) {
      console.log("Attack error => ", err);
    }
    const currentBankBalance = await bank.getBalance();
    const currentAttackerBalance = await attack.getBalance();
    const stealedBalance = currentAttackerBalance - initialAttackerBalance;
    const stolenBalance = initialBankBalance - currentBankBalance;
    expect(stolenBalance).to.equal(stealedBalance);
    expect(stealedBalance).to.greaterThan(0);
  });
});

describe("Trap Hacker", function () {
  let bank;
  let attack;

  beforeEach(async function () {
    const HoneyPot = await hre.ethers.getContractFactory("HoneyPot");
    const honeyPot = await HoneyPot.deploy();
    await honeyPot.deployed();

    const Bank = await hre.ethers.getContractFactory("Bank");
    bank = await Bank.deploy(honeyPot.address);
    await bank.deployed();

    const Attack = await hre.ethers.getContractFactory("Attack");
    attack = await Attack.deploy(bank.address);
    await attack.deployed();

    // initial deposit
    const accounts = await hre.ethers.getSigners();
    await bank.deposit({
      from: accounts[0].address,
      value: ethers.utils.parseEther("5.0"),
    });

    await attack.deposit({
      from: accounts[0].address,
      value: ethers.utils.parseEther("8.0"),
    });
  });

  it("Should hacker tap", async function () {
    const attackBalance = await attack.getBalance();
    await attack.attack();
    const attackedBalance = await attack.getBalance();
    expect(attackedBalance.toString).to.equal(
      parseFloat(attackBalance.toString()) + 1
    );
  });
});
