
export class DeviceService {
  // Detect device type
  public getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    
    if (width < 768) {
      return 'mobile';
    } else if (width < 1024) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }
  
  // Check if device is iOS
  public isIOS(): boolean {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }
  
  // Check if device is Android
  public isAndroid(): boolean {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /android/.test(userAgent);
  }
  
  // Get iOS version if applicable
  public getIOSVersion(): number | null {
    if (!this.isIOS()) return null;
    
    const userAgent = window.navigator.userAgent;
    const match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    
    if (match) {
      return parseInt(match[1], 10);
    }
    
    return null;
  }
  
  // Check if device supports certain features
  public supportsNotifications(): boolean {
    return 'Notification' in window;
  }
  
  // Check if device supports geolocation
  public supportsGeolocation(): boolean {
    return 'geolocation' in navigator;
  }
  
  // Check if device supports camera
  public supportsCamera(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  
  // Check network connection type
  public getNetworkInfo(): {
    type: 'wifi' | '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
    downlinkSpeed: number;
    isSlowConnection: boolean;
  } {
    // @ts-ignore - TypeScript doesn't have navigator.connection defined
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) {
      return {
        type: 'unknown',
        downlinkSpeed: 0,
        isSlowConnection: false
      };
    }
    
    const type = connection.effectiveType as '4g' | '3g' | '2g' | 'slow-2g';
    const downlinkSpeed = connection.downlink || 0;
    
    // Consider slow connection if not 4g
    const isSlowConnection = type !== '4g';
    
    return {
      type: type || 'unknown',
      downlinkSpeed,
      isSlowConnection
    };
  }
  
  // Adjust image quality based on network
  public getImageQualityForNetwork(): 'low' | 'medium' | 'high' {
    const { type } = this.getNetworkInfo();
    
    switch (type) {
      case '2g':
      case 'slow-2g':
        return 'low';
      case '3g':
        return 'medium';
      default:
        return 'high';
    }
  }
}

export const deviceService = new DeviceService();
