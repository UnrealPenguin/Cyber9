// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ICyber9Items{
    function useOrbs(address _from,uint256 _amount) external;
    function useHpKit(address _from) external;
    function useCdKit(address _from) external;
    function useStatReset(address _from) external ;
    function mintOrbs(address _to, uint256 _amount) external;
    function mintHpKit(address _to, uint256 _amount) external;
    function mintCdKit(address _to, uint256 _amount) external;
    function mintStatReset(address _to, uint256 _amount) external;
}
