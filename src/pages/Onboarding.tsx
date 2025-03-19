
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Camera, MapPin, Plus, ArrowRight, Image, Check } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { cn } from '@/lib/utils';

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary' | 'other' | ''>('');
  const [interestedIn, setInterestedIn] = useState<('male' | 'female' | 'non-binary' | 'other')[]>([]);
  const [age, setAge] = useState(25);
  const [ageRange, setAgeRange] = useState([18, 35]);
  const [locationPermission, setLocationPermission] = useState(false);
  
  const handlePhotoUpload = () => {
    // In a real app, this would be connected to a file upload system
    // For demo purposes, we'll add a sample photo
    if (photos.length < 2) {
      const newPhoto = `https://source.unsplash.com/random/300x300/?portrait?${Date.now()}`;
      setPhotos([...photos, newPhoto]);
      
      toast({
        description: "Photo added successfully",
      });
    }
  };
  
  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };
  
  const toggleInterest = (option: 'male' | 'female' | 'non-binary' | 'other') => {
    if (interestedIn.includes(option)) {
      setInterestedIn(interestedIn.filter(item => item !== option));
    } else {
      setInterestedIn([...interestedIn, option]);
    }
  };
  
  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        toast({
          title: "Name required",
          description: "Please enter your first name",
          variant: "destructive"
        });
        return;
      }
      
      setStep(2);
      return;
    }
    
    if (step === 2) {
      if (photos.length === 0) {
        toast({
          title: "Photo required",
          description: "Please add at least one photo",
          variant: "destructive"
        });
        return;
      }
      
      setStep(3);
      return;
    }
    
    if (step === 3) {
      if (!gender) {
        toast({
          title: "Gender required",
          description: "Please select your gender",
          variant: "destructive"
        });
        return;
      }
      
      if (interestedIn.length === 0) {
        toast({
          title: "Preference required",
          description: "Please select who you're interested in",
          variant: "destructive"
        });
        return;
      }
      
      setStep(4);
      return;
    }
    
    if (step === 4) {
      setStep(5);
      return;
    }
    
    if (step === 5) {
      if (!locationPermission) {
        toast({
          title: "Location permission required",
          description: "Please enable location services to continue",
          variant: "destructive"
        });
        return;
      }
      
      // Complete onboarding
      toast({
        title: "Welcome to Proximity!",
        description: "Your profile has been created successfully.",
      });
      
      // In a real app, we would store the user data and navigate to the home screen
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-border">
        <div 
          className="h-full bg-[#3A86FF] transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        ></div>
      </div>
      
      <div className="container max-w-md mx-auto px-4 py-8">
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold mb-2">What's your first name?</h1>
            <p className="text-muted-foreground mb-6">This is how you'll appear on Proximity</p>
            
            <Input
              type="text"
              placeholder="Your first name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg py-6 mb-8"
            />
            
            <p className="text-sm text-muted-foreground mb-8">
              We only use your first name – your full name stays private.
            </p>
          </div>
        )}
        
        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold mb-2">Add your photos</h1>
            <p className="text-muted-foreground mb-6">Choose up to 2 photos that show you clearly</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                  <img src={photo} alt={`Profile ${index + 1}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {Array.from({ length: 2 - photos.length }).map((_, index) => (
                <div 
                  key={`empty-${index}`} 
                  className="aspect-square rounded-xl border border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-[#3A86FF] transition-colors"
                  onClick={handlePhotoUpload}
                >
                  <div className="w-12 h-12 rounded-full bg-[#3A86FF]/10 flex items-center justify-center mb-2">
                    <Plus className="w-6 h-6 text-[#3A86FF]" />
                  </div>
                  <span className="text-sm text-muted-foreground">Add photo</span>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Make sure your photos clearly show your face to help people recognize you in real life.
            </p>
          </div>
        )}
        
        {step === 3 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold mb-2">About you</h1>
            <p className="text-muted-foreground mb-6">Tell us a bit about yourself</p>
            
            <div className="mb-6">
              <h2 className="text-base font-medium mb-3">I am</h2>
              <div className="grid grid-cols-2 gap-3">
                {(['male', 'female', 'non-binary', 'other'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setGender(option)}
                    className={cn(
                      "py-3 px-4 rounded-lg border transition-all",
                      gender === option
                        ? "border-[#3A86FF] bg-[#3A86FF]/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-[#3A86FF]/50"
                    )}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-base font-medium mb-3">I'm interested in</h2>
              <div className="grid grid-cols-2 gap-3">
                {(['male', 'female', 'non-binary', 'other'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleInterest(option)}
                    className={cn(
                      "py-3 px-4 rounded-lg border transition-all",
                      interestedIn.includes(option)
                        ? "border-[#3A86FF] bg-[#3A86FF]/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-[#3A86FF]/50"
                    )}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {step === 4 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold mb-2">Age preferences</h1>
            <p className="text-muted-foreground mb-6">Set your age and preferences</p>
            
            <div className="mb-6">
              <h2 className="text-base font-medium mb-3">My age is</h2>
              <div className="px-3">
                <Slider
                  value={[age]}
                  min={18}
                  max={80}
                  step={1}
                  onValueChange={(value) => setAge(value[0])}
                  className="mb-2"
                />
                <div className="text-center text-xl font-medium">{age}</div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-base font-medium mb-3">I want to see people aged</h2>
              <div className="px-3">
                <Slider
                  value={ageRange}
                  min={18}
                  max={80}
                  step={1}
                  onValueChange={setAgeRange}
                  className="mb-2"
                />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{ageRange[0]}</span>
                  <span className="text-sm font-medium">{ageRange[1]}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {step === 5 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold mb-2">Location services</h1>
            <p className="text-muted-foreground mb-6">Proximity needs your location to show you who's nearby</p>
            
            <div className="bg-card rounded-xl border border-border p-6 mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#3A86FF]/10 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-[#3A86FF]" />
                </div>
              </div>
              
              <h2 className="text-lg font-medium text-center mb-2">Enable location services</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Proximity uses your location only when you're actively using the app to show you who's at the same venue.
              </p>
              
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg mb-4">
                <div>
                  <h3 className="font-medium">Location services</h3>
                  <p className="text-sm text-muted-foreground">Show you who's nearby</p>
                </div>
                <button
                  onClick={() => setLocationPermission(!locationPermission)}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors",
                    locationPermission ? "bg-[#3A86FF]" : "bg-border"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white transition-transform",
                    locationPermission ? "translate-x-6" : "translate-x-0"
                  )}></div>
                </button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                You can change this setting anytime in your profile
              </p>
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleNext}
          className="w-full py-6 text-base bg-[#3A86FF] hover:bg-[#3A86FF]/90"
        >
          {step === 5 ? "Complete Profile" : "Continue"}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
