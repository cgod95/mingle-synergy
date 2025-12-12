import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Calendar, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PrivateLayout from '@/components/PrivateLayout';
import { toast } from '@/components/ui/use-toast';
import SubscriptionService from '@/services/subscriptionService';

const subscriptionService = new SubscriptionService();

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  bestValue?: boolean;
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

const Billing: React.FC = () => {
  const navigate = useNavigate();
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<Array<{ id: string; last4: string; brand: string; expMonth: number; expYear: number }>>([]);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setIsLoading(true);
      
      // Load tiers
      const availableTiers = subscriptionService.getTiers();
      setTiers(availableTiers);

      // Load current subscription (mock data for now)
      const mockCurrentTier = availableTiers.find((tier: SubscriptionTier) => tier.id === 'premium');
      setCurrentTier(mockCurrentTier || null);

      // Load billing history (mock data)
      setBillingHistory([
        {
          id: '1',
          date: '2024-01-15',
          amount: 9.99,
          description: 'Premium Plan - Monthly',
          status: 'paid',
          invoiceUrl: '#'
        },
        {
          id: '2',
          date: '2023-12-15',
          amount: 9.99,
          description: 'Premium Plan - Monthly',
          status: 'paid',
          invoiceUrl: '#'
        }
      ]);

      // Load payment methods (mock data)
      setPaymentMethods([
        {
          id: 'pm_1',
          last4: '4242',
          brand: 'visa',
          expMonth: 12,
          expYear: 2025
        }
      ]);

    } catch (error) {
      console.error('Failed to load billing data:', error);
      toast({
        title: "Error",
        description: "Failed to load billing information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (tierId: string) => {
    try {
      // In a real app, this would redirect to Stripe checkout
      toast({
        title: "Upgrade Initiated",
        description: `Redirecting to payment for ${tierId} plan...`,
      });
      
      // Simulate redirect
      setTimeout(() => {
        navigate('/payment', { state: { tierId } });
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate upgrade",
        variant: "destructive"
      });
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await subscriptionService.cancelSubscription('current-user-id');
      toast({
        title: "Subscription Canceled",
        description: "Your subscription will end at the end of the current billing period",
      });
      
      // Reload data
      loadBillingData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <PrivateLayout>
        <div className="min-h-screen bg-gray-50 pb-20">
          <div className="max-w-4xl mx-auto p-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-4xl mx-auto p-4">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/9af3d496-4d58-4d8c-9b68-52ff87ec5850',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Billing.tsx:186',message:'Go back button clicked',data:{hasHistory:window.history.length>1},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/settings');
                }
              }}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
            <p className="text-gray-600">Manage your subscription and payment methods</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Plan */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentTier ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{currentTier.name}</h3>
                          <p className="text-gray-600">
                            {formatCurrency(currentTier.price)}/{currentTier.interval}
                          </p>
                        </div>
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          Active
                        </Badge>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-medium mb-2">Features:</h4>
                        <ul className="space-y-1">
                          {currentTier.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleCancelSubscription}>
                          Cancel Subscription
                        </Button>
                        <Button onClick={() => navigate('/settings')}>
                          Manage Plan
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">No Active Plan</h3>
                      <p className="text-gray-600 mb-4">Choose a plan to unlock premium features</p>
                      <Button onClick={() => navigate('/settings')}>
                        View Plans
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Available Plans */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Available Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tiers.map((tier) => (
                      <div
                        key={tier.id}
                        className={`border rounded-lg p-4 ${
                          tier.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        {tier.popular && (
                          <Badge className="mb-2" variant="default">
                            Most Popular
                          </Badge>
                        )}
                        <h3 className="text-lg font-semibold">{tier.name}</h3>
                        <p className="text-2xl font-bold text-gray-900 mb-2">
                          {formatCurrency(tier.price)}
                          <span className="text-sm font-normal text-gray-600">/{tier.interval}</span>
                        </p>
                        <ul className="space-y-1 mb-4">
                          {tier.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="text-sm text-gray-600">• {feature}</li>
                          ))}
                        </ul>
                        <Button
                          onClick={() => handleUpgrade(tier.id)}
                          className="w-full"
                          variant={tier.popular ? "default" : "outline"}
                        >
                          {currentTier?.id === tier.id ? 'Current Plan' : 'Choose Plan'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            •••• {method.last4} - Expires {method.expMonth}/{method.expYear}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {method.brand}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      Add Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Billing History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {billingHistory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{item.description}</p>
                          <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(item.amount)}</p>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      View All Invoices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default Billing; 