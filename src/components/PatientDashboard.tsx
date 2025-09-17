import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { blockchainAPI, walletAPI, MedicalRecord } from '@/lib/blockchain';
import { 
  User, 
  Plus, 
  FileText, 
  Shield, 
  Clock,
  Hash,
  Users,
  Activity
} from 'lucide-react';

interface PatientDashboardProps {
  walletAddress: string;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ walletAddress }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    medicalHistory: ''
  });
  const [grantAccessData, setGrantAccessData] = useState({
    recordId: '',
    doctorAddress: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadPatientRecords();
  }, [walletAddress]);

  const loadPatientRecords = () => {
    const patientRecords = blockchainAPI.getPatientRecords(walletAddress);
    setRecords(patientRecords);
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.medicalHistory) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await blockchainAPI.addMedicalRecord({
        ...formData,
        age: parseInt(formData.age),
        patientAddress: walletAddress
      });

      if (result.success) {
        toast({
          title: "Record Added Successfully",
          description: `Transaction Hash: ${result.transactionHash.substring(0, 20)}...`,
          variant: "default"
        });
        
        setFormData({ name: '', age: '', medicalHistory: '' });
        setShowAddForm(false);
        loadPatientRecords();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add medical record",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantAccess = async (recordId: string) => {
    if (!blockchainAPI.isValidAddress(grantAccessData.doctorAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await blockchainAPI.grantDoctorAccess(recordId, grantAccessData.doctorAddress);
      
      if (result.success) {
        toast({
          title: "Access Granted",
          description: "Doctor can now view your medical record",
          variant: "default"
        });
        loadPatientRecords();
        setGrantAccessData({ recordId: '', doctorAddress: '' });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to grant access",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Patient Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your medical records on the blockchain</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Medical Record
        </Button>
      </div>

      {/* Wallet Info */}
      <Card className="bg-gradient-card border-primary/20 shadow-medical">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Connected Wallet</p>
              <p className="font-mono text-sm">{walletAddress}</p>
            </div>
            <Badge variant="outline" className="border-success text-success">
              Connected
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Add Record Form */}
      {showAddForm && (
        <Card className="bg-gradient-card border-primary/20 shadow-medical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              Add New Medical Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Patient Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter patient name"
                    className="bg-muted/50 border-primary/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Age</label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Enter age"
                    className="bg-muted/50 border-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Medical History</label>
                <Textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  placeholder="Enter medical history, conditions, medications..."
                  className="bg-muted/50 border-primary/20 min-h-[100px]"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                >
                  {isLoading ? 'Processing...' : 'Add to Blockchain'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Medical Records */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Your Medical Records
        </h2>
        
        {records.length === 0 ? (
          <Card className="bg-gradient-card border-dashed border-primary/20">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No medical records found</p>
              <p className="text-sm text-muted-foreground">Add your first medical record to get started</p>
            </CardContent>
          </Card>
        ) : (
          records.map((record) => (
            <Card key={record.id} className="bg-gradient-card border-primary/20 shadow-medical">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-primary">{record.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span>Age: {record.age}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {record.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-success text-success">
                    <Shield className="mr-1 h-3 w-3" />
                    On Blockchain
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Medical History</p>
                  <p className="text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {record.medicalHistory}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium flex items-center gap-1 mb-1">
                      <Hash className="h-4 w-4" />
                      Transaction Hash
                    </p>
                    <p className="font-mono text-xs text-muted-foreground break-all">
                      {record.transactionHash}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-1 mb-1">
                      <Users className="h-4 w-4" />
                      Doctor Access ({record.doctorAccess.length})
                    </p>
                    {record.doctorAccess.length > 0 ? (
                      <div className="space-y-1">
                        {record.doctorAccess.map((doctor, idx) => (
                          <p key={idx} className="font-mono text-xs text-muted-foreground">
                            {doctor}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No doctors granted access</p>
                    )}
                  </div>
                </div>

                {/* Grant Access Section */}
                <div className="border-t border-primary/20 pt-4">
                  <p className="font-medium mb-3">Grant Doctor Access</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter doctor's wallet address (0x...)"
                      value={grantAccessData.recordId === record.id ? grantAccessData.doctorAddress : ''}
                      onChange={(e) => setGrantAccessData({
                        recordId: record.id,
                        doctorAddress: e.target.value
                      })}
                      className="bg-muted/50 border-primary/20 font-mono text-sm"
                    />
                    <Button
                      onClick={() => handleGrantAccess(record.id)}
                      size="sm"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Grant Access
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};