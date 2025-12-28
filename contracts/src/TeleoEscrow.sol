// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TeleoEscrow is Ownable {
    
    // The MNEE Stablecoin Contract Address
    IERC20 public mneeToken;
    
    // The address of your Backend AI (The "Judge")
    address public judgeAddress;

    struct Job {
        uint256 id;
        address client;
        address freelancer;
        uint256 amount;
        string description; // "Write a Python script for..."
        bool isSettled;     // True if paid out or refunded
        bool isApproved;    // True if work was accepted
    }

    uint256 public nextJobId;
    mapping(uint256 => Job) public jobs;

    // Events for your Backend to listen to
    event JobCreated(uint256 indexed jobId, address client, address freelancer, uint256 amount);
    event JobCompleted(uint256 indexed jobId, string verdict);
    event JobRefunded(uint256 indexed jobId);

    constructor(address _mneeTokenAddress, address _judgeAddress) Ownable(msg.sender) {
        mneeToken = IERC20(_mneeTokenAddress);
        judgeAddress = _judgeAddress;
    }

    // Modifier to ensure only the AI Backend can decide fate
    modifier onlyJudge() {
        require(msg.sender == judgeAddress, "Only the Teleo Judge can perform this action");
        _;
    }

    // 1. CLIENT creates a job and locks MNEE
    // Frontend must call mneeToken.approve() BEFORE calling this!
    function createJob(address _freelancer, uint256 _amount, string memory _description) external {
        require(_amount > 0, "Amount must be greater than 0");
        require(_freelancer != address(0), "Invalid freelancer address");

        // Transfer MNEE from Client -> This Contract
        require(mneeToken.transferFrom(msg.sender, address(this), _amount), "MNEE Transfer failed");

        jobs[nextJobId] = Job({
            id: nextJobId,
            client: msg.sender,
            freelancer: _freelancer,
            amount: _amount,
            description: _description,
            isSettled: false,
            isApproved: false
        });

        emit JobCreated(nextJobId, msg.sender, _freelancer, _amount);
        nextJobId++;
    }

    // 2. JUDGE releases funds (AI says PASS)
    function releaseFunds(uint256 _jobId) external onlyJudge {
        Job storage job = jobs[_jobId];
        require(!job.isSettled, "Job already settled");

        job.isSettled = true;
        job.isApproved = true;

        // Pay the Freelancer
        require(mneeToken.transfer(job.freelancer, job.amount), "Transfer to freelancer failed");
        
        emit JobCompleted(_jobId, "PASS");
    }

    // 3. JUDGE refunds client (AI says FAIL/Timeout)
    function refundClient(uint256 _jobId) external onlyJudge {
        Job storage job = jobs[_jobId];
        require(!job.isSettled, "Job already settled");

        job.isSettled = true;
        job.isApproved = false;

        // Refund the Client
        require(mneeToken.transfer(job.client, job.amount), "Refund to client failed");
        
        emit JobRefunded(_jobId);
    }

    // Admin function to update judge if backend wallet changes
    function setJudge(address _newJudge) external onlyOwner {
        judgeAddress = _newJudge;
    }
}