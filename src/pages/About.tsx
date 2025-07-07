import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Users, MapPin, Shield, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

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
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-4xl mx-auto p-4">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">About Mingle</h1>
            <p className="text-gray-600">Connecting people through shared experiences</p>
          </div>

          {/* App Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                App Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Version</h3>
                  <p className="text-gray-600">{appVersion}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Build Date</h3>
                  <p className="text-gray-600">{buildDate}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Platform</h3>
                  <p className="text-gray-600">Web App (PWA)</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Status</h3>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Production Ready
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>
                Building meaningful connections in the real world
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Mingle is revolutionizing how people connect by bringing dating back to the real world. 
                Instead of endless swiping, we help you discover and connect with people at venues you 
                actually visit. Our venue-based matching system creates more authentic connections 
                based on shared interests, locations, and real-world activities.
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
              <CardDescription>
                What makes Mingle unique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Team */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Our Team</CardTitle>
              <CardDescription>
                The people behind Mingle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team.map((member, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm font-medium text-blue-600">{member.role}</p>
                      <p className="text-sm text-gray-600 mt-1">{member.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>
                We'd love to hear from you
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  <p className="text-sm text-gray-600">
                    Email us at: <a href="mailto:support@mingle.com" className="text-blue-600 hover:underline">support@mingle.com</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Links */}
          <Card>
            <CardHeader>
              <CardTitle>Legal</CardTitle>
            </CardHeader>
            <CardContent>
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
    </Layout>
  );
};

export default About; 