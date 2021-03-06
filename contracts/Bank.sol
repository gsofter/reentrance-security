//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Logger.sol";

contract Bank {
    mapping(address => uint256) public balances;
    Logger logger;

    constructor(Logger _logger) {
        logger = Logger(_logger);
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
        logger.log(msg.sender, msg.value, "Deposit");
    }

    function withdraw(uint256 _amount) public {
        require(_amount <= balances[msg.sender], "Insufficient funds");
        console.log("bank.widraw.msgSender => ", msg.sender);
        console.log("bank.widraw.checkBalance =>", getBalance());
        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send Ether");
        balances[msg.sender] -= _amount;
        logger.log(msg.sender, _amount, "Withdraw");
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
