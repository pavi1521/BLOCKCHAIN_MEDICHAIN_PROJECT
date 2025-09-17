const express = require('express');
const cors = require('cors');
const { Web3 } = require('web3');
const multer = require('multer');
const { create } = require('ipfs-http-client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Web3 Configuration
const web3 = new Web3(process.env.WEB3_PROVIDER_URL || 'http://localhost:8545');

// Contract configuration
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = [
    // Add your contract ABI here after compilation
    {
        "inputs": [
            {"internalType": "string", "name": "_name", "type": "string"},
            {"internalType": "uint256", "name": "_age", "type": "uint256"},
            {"internalType": "string", "name": "_medicalHistory", "type": "string"},
            {"internalType": "string", "name": "_ipfsHash", "type": "string"}
        ],
        "name": "addMedicalRecord",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "_doctor", "type": "address"}],
        "name": "grantAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "_patient", "type": "address"}],
        "name": "getMedicalRecord",
        "outputs": [
            {
                "components": [
                    {"internalType": "string", "name": "name", "type": "string"},
                    {"internalType": "uint256", "name": "age", "type": "uint256"},
                    {"internalType": "string", "name": "medicalHistory", "type": "string"},
                    {"internalType": "string", "name": "ipfsHash", "type": "string"},
                    {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                    {"internalType": "bool", "name": "exists", "type": "bool"}
                ],
                "internalType": "struct PatientData.MedicalRecord",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const contract = new web3.eth.Contract(contractABI, contractAddress);

// IPFS Configuration
const ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: `Basic ${Buffer.from(
            process.env.IPFS_PROJECT_ID + ':' + process.env.IPFS_PROJECT_SECRET
        ).toString('base64')}`
    }
});

// Multer configuration for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to estimate gas
async function estimateGas(method, from) {
    try {
        const gasEstimate = await method.estimateGas({ from });
        return gasEstimate;
    } catch (error) {
        console.error('Gas estimation error:', error);
        return 500000; // Default gas limit
    }
}

// Routes

/**
 * @route GET /api/health
 * @desc Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'MedChain Backend Server is running',
        network: process.env.NETWORK_NAME || 'localhost',
        contractAddress: contractAddress
    });
});

/**
 * @route POST /api/medical-record
 * @desc Add new medical record to blockchain
 */
app.post('/api/medical-record', async (req, res) => {
    try {
        const { name, age, medicalHistory, patientAddress, privateKey } = req.body;

        // Validation
        if (!name || !age || !medicalHistory || !patientAddress || !privateKey) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields' 
            });
        }

        // Create account from private key
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        web3.eth.accounts.wallet.add(account);

        // Prepare transaction
        const method = contract.methods.addMedicalRecord(name, age, medicalHistory, '');
        const gas = await estimateGas(method, account.address);
        const gasPrice = await web3.eth.getGasPrice();

        // Send transaction
        const tx = await method.send({
            from: account.address,
            gas,
            gasPrice
        });

        res.json({
            success: true,
            transactionHash: tx.transactionHash,
            blockNumber: tx.blockNumber,
            gasUsed: tx.gasUsed
        });

    } catch (error) {
        console.error('Error adding medical record:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * @route GET /api/medical-record/:patientAddress
 * @desc Get medical record from blockchain
 */
app.get('/api/medical-record/:patientAddress', async (req, res) => {
    try {
        const { patientAddress } = req.params;
        const { doctorAddress } = req.query;

        if (!web3.utils.isAddress(patientAddress)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid patient address' 
            });
        }

        const record = await contract.methods.getMedicalRecord(patientAddress).call({
            from: doctorAddress || patientAddress
        });

        if (!record.exists) {
            return res.status(404).json({ 
                success: false, 
                error: 'Medical record not found' 
            });
        }

        res.json({
            success: true,
            data: {
                name: record.name,
                age: parseInt(record.age),
                medicalHistory: record.medicalHistory,
                ipfsHash: record.ipfsHash,
                timestamp: parseInt(record.timestamp)
            }
        });

    } catch (error) {
        console.error('Error fetching medical record:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * @route POST /api/grant-access
 * @desc Grant doctor access to patient records
 */
app.post('/api/grant-access', async (req, res) => {
    try {
        const { patientAddress, doctorAddress, privateKey } = req.body;

        if (!web3.utils.isAddress(patientAddress) || !web3.utils.isAddress(doctorAddress)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid addresses' 
            });
        }

        // Create account from private key
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        web3.eth.accounts.wallet.add(account);

        // Prepare transaction
        const method = contract.methods.grantAccess(doctorAddress);
        const gas = await estimateGas(method, account.address);
        const gasPrice = await web3.eth.getGasPrice();

        // Send transaction
        const tx = await method.send({
            from: account.address,
            gas,
            gasPrice
        });

        res.json({
            success: true,
            transactionHash: tx.transactionHash,
            blockNumber: tx.blockNumber
        });

    } catch (error) {
        console.error('Error granting access:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * @route GET /api/check-access/:patientAddress/:doctorAddress
 * @desc Check if doctor has access to patient record
 */
app.get('/api/check-access/:patientAddress/:doctorAddress', async (req, res) => {
    try {
        const { patientAddress, doctorAddress } = req.params;

        if (!web3.utils.isAddress(patientAddress) || !web3.utils.isAddress(doctorAddress)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid addresses' 
            });
        }

        const hasAccess = await contract.methods.checkAccess(patientAddress, doctorAddress).call();

        res.json({
            success: true,
            hasAccess: hasAccess
        });

    } catch (error) {
        console.error('Error checking access:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * @route POST /api/upload-document
 * @desc Upload medical document to IPFS
 */
app.post('/api/upload-document', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'No file uploaded' 
            });
        }

        // Upload to IPFS
        const result = await ipfs.add(req.file.buffer);
        
        res.json({
            success: true,
            ipfsHash: result.path,
            size: req.file.size,
            filename: req.file.originalname
        });

    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * @route GET /api/download-document/:hash
 * @desc Download document from IPFS
 */
app.get('/api/download-document/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        
        const chunks = [];
        for await (const chunk of ipfs.cat(hash)) {
            chunks.push(chunk);
        }
        
        const data = Buffer.concat(chunks);
        
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(data);

    } catch (error) {
        console.error('Error downloading from IPFS:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * @route GET /api/events
 * @desc Get contract events (medical record additions, access grants, etc.)
 */
app.get('/api/events', async (req, res) => {
    try {
        const { fromBlock = 0, toBlock = 'latest' } = req.query;

        const events = await contract.getPastEvents('allEvents', {
            fromBlock: fromBlock,
            toBlock: toBlock
        });

        const formattedEvents = events.map(event => ({
            event: event.event,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            returnValues: event.returnValues,
            timestamp: new Date(event.blockNumber * 1000) // Approximate
        }));

        res.json({
            success: true,
            events: formattedEvents
        });

    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 MedChain Backend Server running on port ${PORT}`);
    console.log(`📊 Network: ${process.env.NETWORK_NAME || 'localhost'}`);
    console.log(`📄 Contract: ${contractAddress || 'Not set'}`);
});

module.exports = app;