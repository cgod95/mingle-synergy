import React, { useState, useEffect } from 'react';
import { X, Check, Star, Zap, Heart, Eye, MessageCircle, Filter, Headphones, RotateCcw } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { subscriptionService } from '@/services';
import { logError, logUserAction } from '@/utils/errorHandler';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'match_limit' | 'message_limit' | 'manual';
}

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  trigger = 'manual'
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{ valid: boolean; message?: string; discount?: number } | null>(null);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        // Handle both getPlans (mock) and getTiers (real service)
        const plansData = 'getPlans' in subscriptionService && typeof subscriptionService.getPlans === 'function'
          ? await subscriptionService.getPlans()
          : 'getTiers' in subscriptionService && typeof subscriptionService.getTiers === 'function'
          ? subscriptionService.getTiers()
          : [];
        setPlans(plansData.filter((plan: any) => plan.id !== 'free'));
      } catch (error) {
        logError(error as Error, { source: 'PremiumUpgradeModal', action: 'loadPlans' });
        setPlans([]);
      }
    };
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const features = [
    { icon: Zap, text: 'Unlimited matches', free: false, premium: true },
    { icon: MessageCircle, text: 'Unlimited messaging', free: false, premium: true },
    { icon: Eye, text: 'See who liked you', free: false, premium: true },
    { icon: Filter, text: 'Advanced filters', free: false, premium: true },
    { icon: Headphones, text: 'Priority support', free: false, premium: true },
    { icon: RotateCcw, text: 'Undo last swipe', free: false, premium: true },
    { icon: Heart, text: 'Read receipts', free: false, premium: true },
    { icon: Star, text: 'Profile boost', free: false, premium: true }
  ];

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // Handle subscription creation - check which method exists
      if ('createSubscription' in subscriptionService && typeof subscriptionService.createSubscription === 'function') {
        // Real service - would need userId and paymentMethodId
        logUserAction('createSubscription', { source: 'PremiumUpgradeModal', note: 'requires user authentication' });
        // In a real app, you'd get userId from auth context and handle payment
      } else {
        // Mock service - just close modal for demo
        logUserAction('createSubscription', { source: 'PremiumUpgradeModal', plan: selectedPlan, note: 'mock subscription' });
      }
      onClose();
      // Show success message or redirect
    } catch (error) {
      logError(error as Error, { source: 'PremiumUpgradeModal', action: 'handleSubscribe', plan: selectedPlan });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim()) return;
    
    // Promo code functionality not implemented in services yet
    setPromoResult({ valid: false, message: 'Promo code feature coming soon' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="relative p-6 border-b border-neutral-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-8 h-8 text-yellow-500 mr-2" />
              <h2 className="text-3xl font-bold text-neutral-900">
                Upgrade to Premium
              </h2>
            </div>
            <p className="text-neutral-600 text-lg">
              {trigger === 'match_limit' && "You've reached your daily match limit. Upgrade for unlimited matches!"}
              {trigger === 'message_limit' && "Unlock unlimited messaging to keep the conversation flowing!"}
              {trigger === 'manual' && "Unlock all premium features and enhance your dating experience"}
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  selectedPlan === plan.id
                    ? 'ring-2 ring-indigo-500 bg-indigo-50'
                    : 'hover:bg-neutral-50'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  {plan.description && (
                    <CardDescription className="text-neutral-600">{plan.description}</CardDescription>
                  )}
                  
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-neutral-900">
                      ${plan.price}
                    </span>
                    <span className="text-neutral-500 ml-2">
                      /{plan.interval === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  
                  {plan.trialDays && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {plan.trialDays}-day free trial
                      </Badge>
                    </div>
                  )}
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Comparison */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-center">Feature Comparison</h3>
            <div className="bg-neutral-50 rounded-xl p-6">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-neutral-600 mb-4">
                <div>Feature</div>
                <div className="text-center">Free</div>
                <div className="text-center">Premium</div>
              </div>
              
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 items-center py-2 border-b border-neutral-200 last:border-b-0">
                    <div className="flex items-center">
                      <feature.icon className="w-4 h-4 mr-2 text-neutral-500" />
                      <span className="text-neutral-700">{feature.text}</span>
                    </div>
                    <div className="text-center">
                      {feature.free ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-neutral-300 mx-auto" />
                      )}
                    </div>
                    <div className="text-center">
                      {feature.premium ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-neutral-300 mx-auto" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Promo Code */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
              <Button
                onClick={handlePromoCode}
                variant="outline"
                className="whitespace-nowrap"
              >
                Apply
              </Button>
            </div>
            {promoResult && (
              <p className={`mt-2 text-sm ${promoResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                {promoResult.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-lg font-semibold"
            >
              {isLoading ? 'Processing...' : `Start ${selectedPlan === 'premium_yearly' ? 'Yearly' : 'Monthly'} Plan`}
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 text-center text-sm text-neutral-500">
            <p>🔒 Secure payment • Cancel anytime • 7-day free trial</p>
            <p className="mt-1">By continuing, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumUpgradeModal; 