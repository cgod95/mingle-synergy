import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Users, MapPin, Shield, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { goBackSafely } from '@/utils/navigation';
import PublicLayout from '@/components/PublicLayout';

const About: React.FC = () => {
  const navigate = useNavigate();
  
  const appVersion = '1.0.0';
  const buildDate = new Date().toLocaleDateString();
  
  const features = [
    {
      icon: MapPin,
      title: 'Venue-Based Matching',
      description: 'Connect with people at your favorite places'
    },
    {
      icon: Heart,
      title: 'Smart Matching',
      description: 'AI-powered compatibility scoring'
    },
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Built-in safety features and verification'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Instant notifications and live updates'
    }
  ];

  const team = [
    {
      name: 'Development Team',
      role: 'Core Development',
      description: 'Building the future of social connections'
    },
    {
      name: 'Design Team',
      role: 'UX/UI Design',
      description: 'Creating beautiful, intuitive experiences'
    },
    {
      name: 'Safety Team',
      role: 'Trust & Safety',
      description: 'Ensuring a safe environment for all users'
    }
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-neutral-900 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goBackSafely(navigate, '/settings')}
              className="hover:bg-indigo-900/30 text-indigo-400"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">About Mingle</h1>
              <p className="text-neutral-300 mt-2">Connecting people through shared experiences</p>
            </div>
          </div>

          {/* App Info */}
          <Card className="mb-6 border-2 border-neutral-700 bg-neutral-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-neutral-700">
              <CardTitle className="flex items-center text-indigo-400">
                <Star className="w-5 h-5 mr-2" />
                App Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-white">Version</h3>
                  <p className="text-neutral-300">{appVersion}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Build Date</h3>
                  <p className="text-neutral-300">{buildDate}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Platform</h3>
                  <p className="text-neutral-300">Web App (PWA)</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Status</h3>
                  <Badge variant="default" className="bg-indigo-900/50 text-indigo-300 border-indigo-700">
                    Production Ready
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission */}
          <Card className="mb-6 border-2 border-neutral-700 bg-neutral-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-neutral-700">
              <CardTitle className="text-indigo-400">Our Mission</CardTitle>
              <CardDescription className="text-neutral-300">
                Building meaningful connections in the real world
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-neutral-300 leading-relaxed">
                Mingle is revolutionizing how people connect by bringing dating back to the real world. 
                Instead of endless swiping, we help you discover and connect with people at venues you 
                actually visit. Our venue-based matching system creates more authentic connections 
                based on shared interests, locations, and real-world activities.
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="mb-6 border-2 border-neutral-700 bg-neutral-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-neutral-700">
              <CardTitle className="text-indigo-400">Key Features</CardTitle>
              <CardDescription className="text-neutral-300">
                What makes Mingle unique
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-neutral-700/50 rounded-lg">
                      <Icon className="w-6 h-6 text-indigo-400 mt-1" />
                      <div>
                        <h3 className="font-semibold text-white">{feature.title}</h3>
                        <p className="text-sm text-neutral-300">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Team */}
          <Card className="mb-6 border-2 border-neutral-700 bg-neutral-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-neutral-700">
              <CardTitle className="text-indigo-400">Our Team</CardTitle>
              <CardDescription className="text-neutral-300">
                The people behind Mingle
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {team.map((member, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-neutral-700/50 rounded-lg">
                    <Users className="w-6 h-6 text-indigo-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white">{member.name}</h3>
                      <p className="text-sm font-medium text-indigo-400">{member.role}</p>
                      <p className="text-sm text-neutral-300 mt-1">{member.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="mb-6 border-2 border-neutral-700 bg-neutral-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-neutral-700">
              <CardTitle className="text-indigo-400">Get in Touch</CardTitle>
              <CardDescription className="text-neutral-300">
                We'd love to hear from you
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/contact')}
                    className="flex-1"
                  >
                    Contact Support
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/help')}
                    className="flex-1"
                  >
                    Help Center
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-sm text-neutral-300">
                    Email us at: <a href="mailto:support@mingle.com" className="text-indigo-400 hover:underline">support@mingle.com</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Links */}
          <Card className="border-2 border-neutral-700 bg-neutral-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-neutral-700">
              <CardTitle className="text-indigo-400">Legal</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/terms')}
                  className="justify-start"
                >
                  Terms of Service
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/privacy')}
                  className="justify-start"
                >
                  Privacy Policy
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/safety')}
                  className="justify-start"
                >
                  Safety Guidelines
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default About; 