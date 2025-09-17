// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PatientData
 * @dev Smart contract for managing patient medical records on blockchain
 * Features:
 * - Secure storage of patient data
 * - Access control for doctors/hospitals
 * - Event logging for all operations
 * - IPFS integration for document storage
 */
contract PatientData {
    
    struct MedicalRecord {
        string name;
        uint256 age;
        string medicalHistory;
        string ipfsHash; // Hash of medical documents stored on IPFS
        uint256 timestamp;
        bool exists;
    }
    
    struct AccessPermission {
        address doctor;
        bool granted;
        uint256 timestamp;
    }
    
    // Mappings
    mapping(address => MedicalRecord) private patientRecords;
    mapping(address => mapping(address => AccessPermission)) private doctorAccess;
    mapping(address => address[]) private patientDoctors; // List of doctors with access
    
    // Events
    event MedicalRecordAdded(
        address indexed patient,
        string name,
        uint256 age,
        uint256 timestamp
    );
    
    event AccessGranted(
        address indexed patient,
        address indexed doctor,
        uint256 timestamp
    );
    
    event AccessRevoked(
        address indexed patient,
        address indexed doctor,
        uint256 timestamp
    );
    
    event RecordAccessed(
        address indexed patient,
        address indexed doctor,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyPatient(address _patient) {
        require(msg.sender == _patient, "Only patient can perform this action");
        _;
    }
    
    modifier patientExists(address _patient) {
        require(patientRecords[_patient].exists, "Patient record does not exist");
        _;
    }
    
    modifier hasAccess(address _patient) {
        require(
            msg.sender == _patient || 
            (doctorAccess[_patient][msg.sender].granted && doctorAccess[_patient][msg.sender].doctor == msg.sender),
            "Access denied"
        );
        _;
    }
    
    /**
     * @dev Add or update patient medical record
     * @param _name Patient name
     * @param _age Patient age
     * @param _medicalHistory Medical history and conditions
     * @param _ipfsHash IPFS hash for medical documents
     */
    function addMedicalRecord(
        string memory _name,
        uint256 _age,
        string memory _medicalHistory,
        string memory _ipfsHash
    ) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_age > 0 && _age < 150, "Invalid age");
        require(bytes(_medicalHistory).length > 0, "Medical history cannot be empty");
        
        patientRecords[msg.sender] = MedicalRecord({
            name: _name,
            age: _age,
            medicalHistory: _medicalHistory,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            exists: true
        });
        
        emit MedicalRecordAdded(msg.sender, _name, _age, block.timestamp);
    }
    
    /**
     * @dev Grant access to a doctor/hospital
     * @param _doctor Address of the doctor to grant access
     */
    function grantAccess(address _doctor) 
        public 
        onlyPatient(msg.sender) 
        patientExists(msg.sender) 
    {
        require(_doctor != address(0), "Invalid doctor address");
        require(_doctor != msg.sender, "Cannot grant access to yourself");
        require(!doctorAccess[msg.sender][_doctor].granted, "Access already granted");
        
        doctorAccess[msg.sender][_doctor] = AccessPermission({
            doctor: _doctor,
            granted: true,
            timestamp: block.timestamp
        });
        
        patientDoctors[msg.sender].push(_doctor);
        
        emit AccessGranted(msg.sender, _doctor, block.timestamp);
    }
    
    /**
     * @dev Revoke access from a doctor
     * @param _doctor Address of the doctor to revoke access
     */
    function revokeAccess(address _doctor) 
        public 
        onlyPatient(msg.sender) 
        patientExists(msg.sender) 
    {
        require(doctorAccess[msg.sender][_doctor].granted, "Access not granted");
        
        doctorAccess[msg.sender][_doctor].granted = false;
        
        // Remove doctor from the list
        address[] storage doctors = patientDoctors[msg.sender];
        for (uint i = 0; i < doctors.length; i++) {
            if (doctors[i] == _doctor) {
                doctors[i] = doctors[doctors.length - 1];
                doctors.pop();
                break;
            }
        }
        
        emit AccessRevoked(msg.sender, _doctor, block.timestamp);
    }
    
    /**
     * @dev Get patient medical record
     * @param _patient Address of the patient
     * @return MedicalRecord struct
     */
    function getMedicalRecord(address _patient) 
        public 
        view 
        hasAccess(_patient) 
        patientExists(_patient)
        returns (MedicalRecord memory) 
    {
        return patientRecords[_patient];
    }
    
    /**
     * @dev Get patient medical record (with access logging)
     * @param _patient Address of the patient
     * @return MedicalRecord struct
     */
    function accessMedicalRecord(address _patient) 
        public 
        hasAccess(_patient) 
        patientExists(_patient)
        returns (MedicalRecord memory) 
    {
        // Log the access if it's a doctor accessing
        if (msg.sender != _patient) {
            emit RecordAccessed(_patient, msg.sender, block.timestamp);
        }
        
        return patientRecords[_patient];
    }
    
    /**
     * @dev Check if doctor has access to patient record
     * @param _patient Address of the patient
     * @param _doctor Address of the doctor
     * @return bool indicating access status
     */
    function checkAccess(address _patient, address _doctor) 
        public 
        view 
        returns (bool) 
    {
        return doctorAccess[_patient][_doctor].granted;
    }
    
    /**
     * @dev Get list of doctors with access to patient record
     * @param _patient Address of the patient
     * @return Array of doctor addresses
     */
    function getAuthorizedDoctors(address _patient) 
        public 
        view 
        onlyPatient(_patient)
        returns (address[] memory) 
    {
        return patientDoctors[_patient];
    }
    
    /**
     * @dev Get patient's own record
     * @return MedicalRecord struct
     */
    function getMyRecord() 
        public 
        view 
        patientExists(msg.sender)
        returns (MedicalRecord memory) 
    {
        return patientRecords[msg.sender];
    }
    
    /**
     * @dev Check if patient record exists
     * @param _patient Address of the patient
     * @return bool indicating existence
     */
    function recordExists(address _patient) 
        public 
        view 
        returns (bool) 
    {
        return patientRecords[_patient].exists;
    }
}