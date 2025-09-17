import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { blockchainAPI, MedicalRecord } from '@/lib/blockchain';
import { 
  Stethoscope, 
  FileText, 
  Clock, 
  Hash, 
  User,
  Activity,
  Shield,
  Eye
} from 'lucide-react';

interface DoctorDashboardProps {
  walletAddress: string;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ walletAddress }) => {
  const [accessibleRecords, setAccessibleRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    loadAccessibleRecords();
  }, [walletAddress]);

  const loadAccessibleRecords = () => {
    const records = blockchainAPI.getDoctorAccessibleRecords(walletAddress);
    setAccessibleRecords(records);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Doctor Dashboard
        </h1>
        <p className="text-muted-foreground">Access authorized patient medical records</p>
      </div>

      {/* Doctor Info */}
      <Card className="bg-gradient-card border-primary/20 shadow-medical">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Doctor Wallet</p>
              <p className="font-mono text-sm">{walletAddress}</p>
            </div>
            <Badge variant="outline" className="border-primary text-primary">
              Medical Professional
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Accessible Records */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          Authorized Patient Records ({accessibleRecords.length})
        </h2>

        {accessibleRecords.length === 0 ? (
          <Card className="bg-gradient-card border-dashed border-primary/20">
            <CardContent className="p-12 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No patient records accessible</p>
              <p className="text-sm text-muted-foreground">
                Patients must grant you access to view their medical records
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {accessibleRecords.map((record) => (
              <Card 
                key={record.id} 
                className={`bg-gradient-card border-primary/20 shadow-medical cursor-pointer transition-all duration-200 ${
                  selectedRecord?.id === record.id 
                    ? 'ring-2 ring-primary shadow-glow' 
                    : 'hover:shadow-glow hover:border-primary/40'
                }`}
                onClick={() => setSelectedRecord(selectedRecord?.id === record.id ? null : record)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-primary flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {record.name}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <span>Age: {record.age}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {record.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="border-success text-success mb-2">
                        <Shield className="mr-1 h-3 w-3" />
                        Authorized Access
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Click to {selectedRecord?.id === record.id ? 'collapse' : 'expand'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                {selectedRecord?.id === record.id && (
                  <CardContent className="border-t border-primary/20 space-y-4">
                    <div>
                      <p className="font-medium mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Medical History & Conditions
                      </p>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-muted-foreground leading-relaxed">
                          {record.medicalHistory}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium flex items-center gap-1 mb-2">
                          <Hash className="h-4 w-4" />
                          Blockchain Transaction
                        </p>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="font-mono text-xs text-muted-foreground break-all">
                            {record.transactionHash}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium flex items-center gap-1 mb-2">
                          <FileText className="h-4 w-4" />
                          Medical Reports Hash
                        </p>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="font-mono text-xs text-muted-foreground">
                            {record.reportHash}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            IPFS Hash for medical documents
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Patient Wallet Address</p>
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="font-mono text-xs text-muted-foreground break-all">
                          {record.patientAddress}
                        </p>
                      </div>
                    </div>

                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-warning mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-warning-foreground">
                            Confidential Medical Information
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            This information is protected by patient privacy laws and blockchain access controls. 
                            Use only for authorized medical purposes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};