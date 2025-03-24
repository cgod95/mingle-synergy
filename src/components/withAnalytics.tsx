
import React, { useEffect } from 'react';
import { trackScreenView } from '../services/appAnalytics';

export const withAnalytics = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenName: string
) => {
  const WithAnalytics: React.FC<P> = (props) => {
    useEffect(() => {
      // Track screen view when component mounts
      trackScreenView(screenName);
    }, []);

    return <WrappedComponent {...props} />;
  };

  WithAnalytics.displayName = `WithAnalytics(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithAnalytics;
};
