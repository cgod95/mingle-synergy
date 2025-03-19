
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, Phone } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleNext = () => {
    if (step === 1) {
      if (authMethod === 'email' && !email) {
        toast({
          title: "Email required",
          description: "Please enter your email address",
          variant: "destructive"
        });
        return;
      }
      
      if (authMethod === 'phone' && !phone) {
        toast({
          title: "Phone required",
          description: "Please enter your phone number",
          variant: "destructive"
        });
        return;
      }
      
      // Simulate sending verification code
      toast({
        title: "Verification code sent",
        description: authMethod === 'email' ? 
          `We've sent a code to ${email}` : 
          `We've sent a code to ${phone}`
      });
      
      setStep(2);
      return;
    }
    
    if (step === 2) {
      if (!verificationCode) {
        toast({
          title: "Code required",
          description: "Please enter the verification code",
          variant: "destructive"
        });
        return;
      }
      
      // Simulate verification
      if (verificationCode === '1234') { // Demo only - in real app would verify with backend
        navigate('/onboarding');
      } else {
        toast({
          title: "Invalid code",
          description: "Please enter the correct verification code",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#3A86FF] mb-2">Proximity</h1>
          <p className="text-muted-foreground">Connect with people in the real world</p>
        </div>
        
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm animate-scale-in">
          {step === 1 && (
            <>
              <h2 className="text-2xl font-semibold mb-6">Create your account</h2>
              
              <div className="space-y-4 mb-8">
                <div 
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    authMethod === 'email' 
                      ? 'border-[#3A86FF] bg-[#3A86FF]/10' 
                      : 'border-border hover:border-[#3A86FF]/50'
                  }`}
                  onClick={() => setAuthMethod('email')}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#3A86FF]/20 flex items-center justify-center mr-3">
                      <Mail className="w-5 h-5 text-[#3A86FF]" />
                    </div>
                    <div>
                      <h3 className="font-medium">Continue with Email</h3>
                      <p className="text-sm text-muted-foreground">We'll send a verification code</p>
                    </div>
                  </div>
                  
                  {authMethod === 'email' && (
                    <div className="mt-4">
                      <Input 
                        type="email" 
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </div>
                  )}
                </div>
                
                <div 
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    authMethod === 'phone' 
                      ? 'border-[#3A86FF] bg-[#3A86FF]/10' 
                      : 'border-border hover:border-[#3A86FF]/50'
                  }`}
                  onClick={() => setAuthMethod('phone')}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#3A86FF]/20 flex items-center justify-center mr-3">
                      <Phone className="w-5 h-5 text-[#3A86FF]" />
                    </div>
                    <div>
                      <h3 className="font-medium">Continue with Phone</h3>
                      <p className="text-sm text-muted-foreground">We'll send a verification code</p>
                    </div>
                  </div>
                  
                  {authMethod === 'phone' && (
                    <div className="mt-4">
                      <Input 
                        type="tel" 
                        placeholder="Your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {step === 2 && (
            <>
              <h2 className="text-2xl font-semibold mb-6">Enter verification code</h2>
              
              <p className="text-muted-foreground mb-4">
                We've sent a code to {authMethod === 'email' ? email : phone}
              </p>
              
              <div className="mb-8">
                <Input 
                  type="text" 
                  placeholder="Enter 4-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="text-center text-lg py-6"
                  maxLength={4}
                />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Didn't receive a code? <button className="text-[#3A86FF]">Resend</button>
                </p>
              </div>
            </>
          )}
          
          <Button 
            onClick={handleNext}
            className="w-full bg-[#3A86FF] hover:bg-[#3A86FF]/90"
          >
            {step === 1 ? 'Continue' : 'Verify'} <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account? <Link to="/sign-in" className="text-[#3A86FF]">Sign in</Link>
            </p>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-8 text-center">
          By continuing, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
