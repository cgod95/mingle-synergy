import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, MessageCircle, BookOpen, Video, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '@/components/PublicLayout';

const Help: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How does Mingle work?",
      answer: "Mingle connects you with people at real venues. Check into a venue, see who else is there, and start meaningful conversations. No swiping, no endless scrolling - just genuine connections in real places."
    },
    {
      question: "How do I check into a venue?",
      answer: "Navigate to the Venues tab, find a venue you're at, and tap the 'Check In' button. You'll need to be within the venue's location radius to check in successfully."
    },
    {
      question: "What happens when I match with someone?",
      answer: "When you both like each other's profiles, you'll be notified of the match. You can then start chatting and arrange to meet up at the venue or plan to meet elsewhere."
    },
    {
      question: "Is my location shared with others?",
      answer: "Your exact location is never shared. Only the venue you're checked into is visible to other users, and only when you're actively checked in."
    },
    {
      question: "How do I report inappropriate behavior?",
      answer: "You can report users through their profile or in the chat. Tap the three dots menu and select 'Report' to flag inappropriate content or behavior."
    },
    {
      question: "Can I delete my account?",
      answer: "Yes, you can delete your account in Settings > Data & Storage > Delete Account. This will permanently remove all your data from our servers."
    }
  ];

  const helpCategories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      description: "Learn the basics of using Mingle",
      items: ["Creating your profile", "Finding venues", "Making your first check-in"]
    },
    {
      title: "Safety & Privacy",
      icon: MessageCircle,
      description: "Stay safe while using the app",
      items: ["Privacy settings", "Reporting users", "Blocking users"]
    },
    {
      title: "Troubleshooting",
      icon: Search,
      description: "Common issues and solutions",
      items: ["Check-in problems", "Message issues", "App not working"]
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
              onClick={() => navigate(-1)}
              className="hover:bg-indigo-900/30 text-indigo-400"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Help Center</h1>
              <p className="text-neutral-300 mt-2">Find answers to common questions and get support</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-10 pr-4 py-3 border border-neutral-700 bg-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Help Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {helpCategories.map((category, index) => (
              <Card key={index} className="border-2 border-neutral-700 bg-neutral-800 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-neutral-700">
                  <CardTitle className="flex items-center text-indigo-400">
                    <category.icon className="w-5 h-5 mr-2" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-neutral-300 mb-4">{category.description}</p>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-neutral-300">• {item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <Card className="mb-8 border-2 border-neutral-700 bg-neutral-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-neutral-700">
              <CardTitle className="text-indigo-400">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-neutral-300">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="border-2 border-neutral-700 bg-neutral-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-neutral-700">
              <CardTitle className="text-indigo-400">Still Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
                  <h3 className="font-semibold mb-2 text-white">Email Support</h3>
                  <p className="text-neutral-300 mb-4">Get a response within 24 hours</p>
                  <Button onClick={() => window.location.href = 'mailto:support@mingle.com'}>
                    Send Email
                  </Button>
                </div>
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
                  <h3 className="font-semibold mb-2 text-white">Send Feedback</h3>
                  <p className="text-neutral-300 mb-4">Share your thoughts and suggestions</p>
                  <Button variant="outline" onClick={() => navigate('/feedback')}>
                    Give Feedback
                  </Button>
                </div>
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
                  <h3 className="font-semibold mb-2 text-white">Contact Support</h3>
                  <p className="text-neutral-300 mb-4">Reach out to our support team</p>
                  <Button variant="outline" onClick={() => navigate('/contact')}>
                    Contact Us
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Help; 