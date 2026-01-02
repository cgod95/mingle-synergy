import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, MapPin, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";

const PhilosophyIntro = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-6 flex flex-col h-full justify-between">
      <div>
        <h1 className="text-2xl font-bold text-center mb-8 text-brand-primary">Welcome to Mingle</h1>
        
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="bg-brand-primary/10 rounded-full p-2 mr-4">
              <ArrowRight className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1 text-foreground">This isn't a dating app</h3>
              <p className="text-muted-foreground">It's a tool to help you meet people in the real world.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-brand-primary/10 rounded-full p-2 mr-4">
              <Plus className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1 text-foreground">Say hi now, not later</h3>
              <p className="text-muted-foreground">Matches expire to encourage you to meet in person. Don't wait - say hi!</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-brand-primary/10 rounded-full p-2 mr-4">
              <MapPin className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1 text-foreground">Find people right where you are</h3>
              <p className="text-muted-foreground">No endless browsing. Connect with people at the same venues you visit.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-brand-primary/10 rounded-full p-2 mr-4">
              <MessageSquare className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1 text-foreground">Real connections over endless chats</h3>
              <p className="text-muted-foreground">Skip the weeks of texting. Find the courage to talk face-to-face.</p>
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={() => navigate('/checkin')} 
        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-6 rounded-full font-medium mt-8"
      >
        Get Started
      </Button>
    </div>
  );
};

export default PhilosophyIntro;
