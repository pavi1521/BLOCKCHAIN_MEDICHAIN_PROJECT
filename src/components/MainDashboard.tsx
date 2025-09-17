import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { walletAPI, blockchainAPI, Transaction } from '@/lib/blockchain';
import { PatientDashboard } from './PatientDashboard';
import { DoctorDashboard } from './DoctorDashboard';
import { 
  Wallet, 
  Activity, 
  Shield, 
  Users, 
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const MainDashboard: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    loadTransactions();
    const interval = setInterval(loadTransactions, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTransactions = () => {
    const recentTransactions = blockchainAPI.getTransactions();
    setTransactions(recentTransactions);
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const wallet = await walletAPI.connect();
      const balance = await walletAPI.getBalance();
      
      setWalletConnected(true);
      setWalletAddress(wallet.address);
      setWalletBalance(balance);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${wallet.network}`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getTransactionStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-warning animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'ADD_RECORD':
        return 'Medical Record Added';
      case 'GRANT_ACCESS':
        return 'Access Granted';
      case 'VIEW_RECORD':
        return 'Record Viewed';
      default:
        return type;
    }
  };

  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-background bg-gradient-mesh">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                MedChain Portal
              </h1>
              <p className="text-xl text-muted-foreground">
                Secure Blockchain-based Patient Data Management System
              </p>
            </div>

            <Card className="bg-gradient-card border-primary/20 shadow-medical">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Wallet className="h-5 w-5" />
                  Connect Your Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Connect your Ethereum wallet to access your medical records or view authorized patient data.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-3">Select User Type:</p>
                    <div className="flex gap-2">
                      <Button
                        variant={userType === 'patient' ? 'default' : 'outline'}
                        onClick={() => setUserType('patient')}
                        className={userType === 'patient' ? 'bg-gradient-primary text-primary-foreground' : ''}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Patient
                      </Button>
                      <Button
                        variant={userType === 'doctor' ? 'default' : 'outline'}
                        onClick={() => setUserType('doctor')}
                        className={userType === 'doctor' ? 'bg-gradient-primary text-primary-foreground' : ''}
                      >
                        <Activity className="mr-2 h-4 w-4" />
                        Doctor
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
                    size="lg"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-4 w-4" />
                        Connect Wallet
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Supports MetaMask, WalletConnect, and other Web3 wallets</p>
                  <p>• Connected to Polygon Mumbai Testnet</p>
                  <p>• Your data is secured with blockchain technology</p>
                </div>
              </CardContent>
            </Card>

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
              <Card className="bg-gradient-card border-primary/20 shadow-medical">
                <CardContent className="p-6 text-center">
                  <Shield className="h-8 w-8 mx-auto text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Secure Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    Medical records stored securely on blockchain with cryptographic protection
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-primary/20 shadow-medical">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Access Control</h3>
                  <p className="text-sm text-muted-foreground">
                    Patients control who can access their medical data with smart contracts
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-primary/20 shadow-medical">
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto text-primary mb-3" />
                  <h3 className="font-semibold mb-2">IPFS Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Medical documents stored on IPFS for distributed, tamper-proof storage
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-gradient-mesh">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MedChain Portal
            </h1>
            <p className="text-muted-foreground">Blockchain Patient Data Management</p>
          </div>
          
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{walletBalance} MATIC</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                  </p>
                </div>
                <Badge variant="outline" className="border-success text-success">
                  Connected
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={userType} onValueChange={(value) => setUserType(value as 'patient' | 'doctor')}>
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="patient" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              <Users className="mr-2 h-4 w-4" />
              Patient View
            </TabsTrigger>
            <TabsTrigger value="doctor" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              <Activity className="mr-2 h-4 w-4" />
              Doctor View
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              <Clock className="mr-2 h-4 w-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patient" className="mt-6">
            <PatientDashboard walletAddress={walletAddress} />
          </TabsContent>

          <TabsContent value="doctor" className="mt-6">
            <DoctorDashboard walletAddress={walletAddress} />
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Recent Blockchain Transactions
              </h2>
              
              {transactions.length === 0 ? (
                <Card className="bg-gradient-card border-dashed border-primary/20">
                  <CardContent className="p-12 text-center">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No recent transactions</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <Card key={tx.hash} className="bg-gradient-card border-primary/20 shadow-medical">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTransactionStatusIcon(tx.status)}
                            <div>
                              <p className="font-medium">{getTransactionTypeLabel(tx.type)}</p>
                              <p className="text-sm font-mono text-muted-foreground">
                                {tx.hash.substring(0, 20)}...
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={tx.status === 'confirmed' ? 'default' : 'outline'}
                              className={
                                tx.status === 'confirmed' 
                                  ? 'bg-success text-success-foreground' 
                                  : tx.status === 'pending' 
                                  ? 'border-warning text-warning' 
                                  : 'border-destructive text-destructive'
                              }
                            >
                              {tx.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {tx.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};