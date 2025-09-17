# Blockchain-based Patient Data Management System

A **decentralized application (dApp)** that gives patients complete control over their medical records using **Ethereum blockchain** and **IPFS**. Patients can securely store data, manage access permissions, and allow doctors/hospitals to view records in a transparent and immutable way.

WEBPAGE IMAGE:
---<img width="1877" height="873" alt="ss1" src="https://github.com/user-attachments/assets/977be43e-7e8c-4987-a3ea-b40f8ae92935" />
WEBPAGE LINK:https://vercel.com/pavi1521s-projects/blockchain-medichain-project

##  Features
- Secure on-chain storage of patient details.  
- Patient-controlled access permissions.  
- IPFS integration for storing large files (PDFs, images).  
- Blockchain event logs for transparency.  
- Dark-themed React UI with real-time transaction feedback.  

---

##  Tech Stack
- **Frontend**: React.js, Material-UI, Ethers.js  
- **Backend**: Node.js, Express.js, Web3.js  
- **Smart Contract**: Solidity  
- **Blockchain**: Ethereum (Hardhat / Ganache / Sepolia)  
- **Storage**: IPFS  

---

##  Installation & Setup

### 1. Prerequisites
- Node.js & npm  
- Git  
- MetaMask (Ethereum wallet)  
- Hardhat (`npm install --global hardhat`)  
- IPFS Desktop  

### 2. Smart Contract Deployment
```bash
cd contracts
npm i
npx hardhat compile
npx hardhat node
npx hardhat run scripts/deploy.js
```
Save **contract address** + **ABI** for backend & frontend.

### 3. Backend Setup
```bash
cd backend
npm i
# update server.js with contractAddress + ABI
npm start
```

### 4. Frontend Setup
```bash
cd frontend
npm i
# update src/web3-config.js with contractAddress + ABI
npm start
```


---

##  Usage
- **Connect Wallet** → Link MetaMask.  
- **Patient Dashboard** → Add records + upload files to IPFS, grant/revoke access.  
- **Doctor View** → Enter patient’s address; view data if permission granted.  

---

##  References
- [Solidity Docs](https://docs.soliditylang.org/)  
- [Hardhat Docs](https://hardhat.org/docs)  
- [IPFS Docs](https://docs.ipfs.tech/)  
- [Ethers.js Docs](https://docs.ethers.org/)  
