// Mock blockchain utilities for demonstration
// In a real implementation, this would use web3.js or ethers.js

export interface MedicalRecord {
  id: string;
  patientAddress: string;
  name: string;
  age: number;
  medicalHistory: string;
  reportHash: string;
  timestamp: Date;
  transactionHash: string;
  doctorAccess: string[];
}

export interface Transaction {
  hash: string;
  type: 'ADD_RECORD' | 'GRANT_ACCESS' | 'VIEW_RECORD';
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

// Mock data storage
const medicalRecords: MedicalRecord[] = [
  {
    id: "1",
    patientAddress: "0x742d35Cc6634C0532925a3b8D2f6a8C987",
    name: "John Doe",
    age: 35,
    medicalHistory: "Hypertension, Type 2 Diabetes",
    reportHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    timestamp: new Date('2024-01-15'),
    transactionHash: "0x8b5f4d2e9a7c6b8e4f2d5a9e7c6b8e4f2d5a9e7c6b8e4f2d5a9e7c6b8e4f2d5",
    doctorAccess: ["0xA3c9B5D7E2f8c4A6E8D5B7A2F4E6C8A2D5B7E9F3C6A8"]
  }
];

const transactions: Transaction[] = [];

// Generate random blockchain-like hash
const generateHash = () => {
  return "0x" + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
};

// Simulate blockchain transaction delay
const simulateTransaction = async (): Promise<string> => {
  const hash = generateHash();
  const transaction: Transaction = {
    hash,
    type: 'ADD_RECORD',
    timestamp: new Date(),
    status: 'pending'
  };
  
  transactions.unshift(transaction);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  transaction.status = 'confirmed';
  return hash;
};

export const blockchainAPI = {
  // Add new medical record
  addMedicalRecord: async (data: {
    name: string;
    age: number;
    medicalHistory: string;
    patientAddress: string;
  }) => {
    const transactionHash = await simulateTransaction();
    
    const record: MedicalRecord = {
      id: Date.now().toString(),
      patientAddress: data.patientAddress,
      name: data.name,
      age: data.age,
      medicalHistory: data.medicalHistory,
      reportHash: `QmX${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      transactionHash,
      doctorAccess: []
    };
    
    medicalRecords.unshift(record);
    return { success: true, transactionHash, recordId: record.id };
  },

  // Get patient records
  getPatientRecords: (patientAddress: string): MedicalRecord[] => {
    return medicalRecords.filter(record => 
      record.patientAddress.toLowerCase() === patientAddress.toLowerCase()
    );
  },

  // Grant doctor access
  grantDoctorAccess: async (recordId: string, doctorAddress: string) => {
    const record = medicalRecords.find(r => r.id === recordId);
    if (record && !record.doctorAccess.includes(doctorAddress)) {
      record.doctorAccess.push(doctorAddress);
      
      const transactionHash = await simulateTransaction();
      return { success: true, transactionHash };
    }
    return { success: false, error: "Record not found or access already granted" };
  },

  // Get accessible records for doctor
  getDoctorAccessibleRecords: (doctorAddress: string): MedicalRecord[] => {
    return medicalRecords.filter(record =>
      record.doctorAccess.some(addr => 
        addr.toLowerCase() === doctorAddress.toLowerCase()
      )
    );
  },

  // Get recent transactions
  getTransactions: (): Transaction[] => {
    return transactions.slice(0, 10);
  },

  // Check if address is valid Ethereum address
  isValidAddress: (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
};

// Mock wallet connection
export const walletAPI = {
  connect: async () => {
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      address: "0x742d35Cc6634C0532925a3b8D2f6a8C987a5b3c8",
      network: "Polygon Mumbai Testnet"
    };
  },

  getBalance: async () => {
    return "2.456"; // ETH or MATIC
  }
};