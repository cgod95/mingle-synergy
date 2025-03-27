
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import ErrorMessage from '@/components/ui/ErrorMessage';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import PageTransition from '@/components/ui/PageTransition';
import services from '@/services';

const CreateProfile = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    // Redirect if no user
    if (!currentUser) {
      navigate('/sign-in');
    }
  }, [currentUser, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!name.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }
    
    if (!age || parseInt(age) < 18 || parseInt(age) > 100) {
      setErrorMessage('Please enter a valid age (18-100)');
      return;
    }
    
    if (!gender) {
      setErrorMessage('Please select your gender');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (currentUser?.uid) {
        await services.user.updateUserProfile(currentUser.uid, {
          name,
          age: parseInt(age, 10),
          gender: gender as 'male' | 'female' | 'non-binary' | 'other',
          interests: [],
          photos: [],
          isCheckedIn: false,
          isVisible: true
        });
        
        localStorage.setItem('profileComplete', 'true');
        
        toast({
          title: "Profile created!",
          description: "Let's continue with the onboarding",
        });
        
        navigate('/onboarding');
      } else {
        throw new Error('User ID not found');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setErrorMessage('Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-bg-secondary rounded-2xl border border-border p-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-6 text-text-primary">Create Your Profile</h1>
            
            {errorMessage && <ErrorMessage message={errorMessage} />}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-text-primary">Your Name</label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="age" className="text-sm font-medium text-text-primary">Your Age</label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="18"
                  max="100"
                  placeholder="Age"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium text-text-primary">Gender</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <LoadingIndicator size="sm" color="white" /> 
                    <span className="ml-2">Creating Profile...</span>
                  </span>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default CreateProfile;
