// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;
pragma experimental "ABIEncoderV2";

contract Decall {

    struct SDPData {
        uint time;
        string sdp;
    }

    struct Room {
        string name;
        bytes32[] members;
    }

    // room, user, sdp
    mapping(string => mapping(string => SDPData)) public sdps;

    // participants
    mapping (string => bytes32[]) public rooms;

    uint256 number;

    constructor() {

    }
    
    function joinRoom(string memory roomId,bytes32 userId) public {
        rooms[roomId].push(userId);
    }

    function putSDP(string memory roomId,string memory userId,string memory sdpString) public returns (string memory) {
        
        sdps[roomId][userId] = SDPData(block.timestamp, sdpString);
        //votesReceived[roomId] = sdpString;
       
        return sdpString;
    }
    
    function getSDP(string memory roomId, string memory userId) public view returns (uint i, string memory s){
        
        SDPData memory sdp = sdps[roomId][userId];
        
        // return (sdp.time, sdp.sdp);
        return (sdp.time, sdp.sdp);
    }

    function getParticipants(string memory roomId) public view returns (bytes32[] memory)  {
        return rooms[roomId];
    }

}