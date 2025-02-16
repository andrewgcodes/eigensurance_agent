// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title EigensurancePolicy
 * @dev Smart contract for managing wildfire insurance policies and claims
 */
contract EigensurancePolicy is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _policyIds;
    
    struct Policy {
        address owner;
        string propertyLocation;
        uint256 coverageAmount;
        uint256 startDate;
        uint256 endDate;
        bool active;
    }

    struct Claim {
        uint256 policyId;
        string claimId;
        uint256 claimDate;
        string location;
        string description;
        uint256 estimatedDamage;
        bytes32 locationVerificationHash;
        bytes32 opacityProof;
        ClaimStatus status;
    }

    enum ClaimStatus { Pending, Approved, Denied }

    mapping(uint256 => Policy) public policies;
    mapping(uint256 => Claim[]) public claims;
    mapping(bytes32 => bool) public verifiedLocations;
    
    event PolicyCreated(uint256 indexed policyId, address indexed owner);
    event ClaimSubmitted(uint256 indexed policyId, string claimId);
    event ClaimVerified(uint256 indexed policyId, string claimId, ClaimStatus status);
    event LocationVerified(bytes32 indexed locationHash);

    constructor() ERC721("EigensurancePolicy", "EINS") {}

    function createPolicy(
        string memory propertyLocation,
        uint256 coverageAmount,
        uint256 duration
    ) external returns (uint256) {
        _policyIds.increment();
        uint256 newPolicyId = _policyIds.current();
        
        policies[newPolicyId] = Policy({
            owner: msg.sender,
            propertyLocation: propertyLocation,
            coverageAmount: coverageAmount,
            startDate: block.timestamp,
            endDate: block.timestamp + duration,
            active: true
        });

        _safeMint(msg.sender, newPolicyId);
        emit PolicyCreated(newPolicyId, msg.sender);
        return newPolicyId;
    }

    function submitClaim(
        uint256 policyId,
        string memory claimId,
        string memory location,
        string memory description,
        uint256 estimatedDamage,
        bytes32 locationHash
    ) external {
        require(_exists(policyId), "Policy does not exist");
        require(ownerOf(policyId) == msg.sender, "Not policy owner");
        require(policies[policyId].active, "Policy not active");
        
        claims[policyId].push(Claim({
            policyId: policyId,
            claimId: claimId,
            claimDate: block.timestamp,
            location: location,
            description: description,
            estimatedDamage: estimatedDamage,
            locationVerificationHash: locationHash,
            opacityProof: bytes32(0),
            status: ClaimStatus.Pending
        }));

        emit ClaimSubmitted(policyId, claimId);
    }

    function verifyLocation(bytes32 locationHash) external onlyOwner {
        verifiedLocations[locationHash] = true;
        emit LocationVerified(locationHash);
    }

    function updateClaimStatus(
        uint256 policyId,
        uint256 claimIndex,
        ClaimStatus status,
        bytes32 opacityProof
    ) external onlyOwner {
        require(_exists(policyId), "Policy does not exist");
        require(claims[policyId].length > claimIndex, "Claim does not exist");
        
        Claim storage claim = claims[policyId][claimIndex];
        claim.status = status;
        claim.opacityProof = opacityProof;
        
        emit ClaimVerified(policyId, claim.claimId, status);
    }

    function getPolicyDetails(uint256 policyId) external view returns (Policy memory) {
        require(_exists(policyId), "Policy does not exist");
        return policies[policyId];
    }

    function getClaimsForPolicy(uint256 policyId) external view returns (Claim[] memory) {
        require(_exists(policyId), "Policy does not exist");
        return claims[policyId];
    }
} 