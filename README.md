# Rock–Paper–Scissors On-Chain (Blockchain Game)

This project implements a fully decentralized **Rock–Paper–Scissors game** using:
- **Solidity smart contract**
- **Ethers.js frontend integration**
- **MetaMask interaction**
- **BSC Testnet / Any EVM chain**

The game allows a user to:
✔ Connect their wallet  
✔ Make an on-chain bet  
✔ Play Rock / Paper / Scissors vs smart contract  
✔ Receive winnings automatically  
✔ Withdraw pending balance  

---

#  1. Smart Contract Deployment (Backend)

The backend is written in Solidity and deployed using **Remix IDE**.

### ▶Steps (from Practice #10 document)
![Screenshot](1.png)

1. Open **Remix IDE**
2. Create a new file: `RPS.sol`
3. Paste the full Solidity contract logic
4. Compile the contract
5. Go to **Deploy & Run Transactions**
6. Set environment: **Injected Provider (MetaMask)**
7. Select **BSC Testnet**
8. Deploy the contract  
   MetaMask will request confirmation.

### Important Deployment Info
![Screenshot](2.png)

- **Contract Address:**  
  `0x4b547ecA0c2F3376E7f5e38626dCee47f03a2413`

- **ABI:**  
  Copy from the Remix "Compiler → ABI" panel  
  (it is also included inside `app.js`).

These values are required by the frontend.

---

#  2. Frontend Integration (index.html + app.js)

The frontend uses **Ethers.js** to call smart contract functions.

### ✔ Add Ethers.js to HTML
```html
<script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.min.js"></script>
<script src="app.js" charset="utf-8"></script>

✔ Add Connect Wallet button
<button id="connectBtn">Connect Wallet</button>

✔ What changed




Old game logic used Math.random()

NEW logic sends a real transaction to the blockchain

Gameplay now:

User clicks Rock/Paper/Scissors

A transaction is sent:
contract.play(moveEnumValue, {value: bet})

MetaMask asks for confirmation

You wait while block is mined (await tx.wait())

UI updates after the Played event is emitted

This means blockchain game is NOT instant — takes 3–10 seconds per round.