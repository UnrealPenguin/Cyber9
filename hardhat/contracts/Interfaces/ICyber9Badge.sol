// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ICyber9Badge {
    function ownerOf(uint256 _tokenId) external view returns (address);
    function useFreeMint(uint256 _tokenId, address _from) external;
    function wipeFreeMints() external;
    function burnBadge(uint256 _tokenId, address _from) external;
}