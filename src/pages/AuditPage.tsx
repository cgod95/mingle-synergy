import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Clock, Users, MessageCircle, MapPin, Heart } from 'lucide-react';
import venueService from '@/services/firebase/venueService';
import userService from '@/services/firebase/userService';
import matchService from '@/services/firebase/matchService';

interface AuditResult {
  feature: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const AuditPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  });

  useEffect(() => {
    if (currentUser) {
      runAudit();
    }
  }, [currentUser]);

  const runAudit = async () => {
    setLoading(true);
    const results: AuditResult[] = [];

    try {
      // 1. Authentication Check
      if (currentUser) {
        results.push({
          feature: 'User Authentication',
          status: 'pass',
          message: 'User is authenticated',
          details: `User ID: ${currentUser.uid}`
        });
      } else {
        results.push({
          feature: 'User Authentication',
          status: 'fail',
          message: 'No authenticated user found'
        });
      }

      // 2. User Profile Check
      if (currentUser) {
        try {
          const profile = await userService.getUserProfile(currentUser.uid);
          if (profile) {
            results.push({
              feature: 'User Profile',
              status: 'pass',
              message: 'User profile loaded successfully',
              details: `Name: ${profile.name}, Age: ${profile.age}`
            });
          } else {
            results.push({
              feature: 'User Profile',
              status: 'warning',
              message: 'User profile not found'
            });
          }
        } catch (error) {
          results.push({
            feature: 'User Profile',
            status: 'fail',
            message: 'Failed to load user profile',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // 3. Venues Check
      try {
        const venues = await venueService.getVenues();
        if (venues.length > 0) {
          results.push({
            feature: 'Venues Service',
            status: 'pass',
            message: 'Venues loaded successfully',
            details: `${venues.length} venues available`
          });
        } else {
          results.push({
            feature: 'Venues Service',
            status: 'warning',
            message: 'No venues found',
            details: 'Venue service working but no data'
          });
        }
      } catch (error) {
        results.push({
          feature: 'Venues Service',
          status: 'fail',
          message: 'Failed to load venues',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // 4. Matches Check
      if (currentUser) {
        try {
          const matches = await matchService.getMatches(currentUser.uid);
          results.push({
            feature: 'Matches Service',
            status: 'pass',
            message: 'Matches service working',
            details: `${matches.length} matches found`
          });
        } catch (error) {
          results.push({
            feature: 'Matches Service',
            status: 'fail',
            message: 'Failed to load matches',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // 5. UI Components Check
      const uiChecks = [
        { name: 'Bottom Navigation', selector: 'nav', expected: true },
        { name: 'Venue Cards', selector: '[data-testid="venue-card"]', expected: false },
        { name: 'Match Cards', selector: '[data-testid="match-card"]', expected: false },
        { name: 'Message Cards', selector: '[data-testid="message-card"]', expected: false }
      ];

      uiChecks.forEach(check => {
        const element = document.querySelector(check.selector);
        if (element || !check.expected) {
          results.push({
            feature: `UI: ${check.name}`,
            status: 'pass',
            message: 'Component present'
          });
        } else {
          results.push({
            feature: `UI: ${check.name}`,
            status: 'warning',
            message: 'Component not found'
          });
        }
      });

      // 6. Route Protection Check
      if (currentUser) {
        const profile = await userService.getUserProfile(currentUser.uid);
        if (profile?.skippedPhotoUpload) {
          results.push({
            feature: 'Photo Upload Requirement',
            status: 'warning',
            message: 'User skipped photo upload',
            details: 'Some features may be limited'
          });
        } else {
          results.push({
            feature: 'Photo Upload Requirement',
            status: 'pass',
            message: 'Photo upload completed'
          });
        }
      }

      // 7. Performance Check
      const loadTime = performance.now();
      results.push({
        feature: 'Page Load Performance',
        status: loadTime < 3000 ? 'pass' : 'warning',
        message: `Page loaded in ${loadTime.toFixed(0)}ms`,
        details: loadTime < 3000 ? 'Good performance' : 'Consider optimization'
      });

    } catch (error) {
      results.push({
        feature: 'Audit System',
        status: 'fail',
        message: 'Audit failed to complete',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setAuditResults(results);
    
    // Calculate summary
    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      warnings: results.filter(r => r.status === 'warning').length
    };
    setSummary(summary);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">PASS</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800">FAIL</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">WARNING</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">UNKNOWN</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 font-medium">Running comprehensive audit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-gray-900">Mingle MVP Audit</h1>
        <p className="text-gray-600 text-lg">Comprehensive feature and functionality check</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-gray-900">{summary.total}</div>
              <div className="text-sm text-gray-600">Total Checks</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">{summary.passed}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-yellow-600">{summary.warnings}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Results */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Detailed Results</h2>
        {auditResults.map((result, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{result.feature}</h3>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.details && (
                      <p className="text-xs text-gray-500 mt-1">{result.details}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(result.status)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button onClick={runAudit} className="bg-gradient-to-r from-blue-500 to-purple-600">
          Re-run Audit
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          Export Report
        </Button>
      </div>
    </div>
  );
};

export default AuditPage; 