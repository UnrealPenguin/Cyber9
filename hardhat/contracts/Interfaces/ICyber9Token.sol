// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ICyber9Token{
    function balanceOf(address _owner) external view returns (uint256);
    function mintBei(address _to, uint256 _amount) external;
    function burnBei(address _from, uint256 _amount) external; 
}