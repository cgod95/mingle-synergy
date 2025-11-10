/**
 * QR Code Generator Utilities
 * 
 * Generates URLs for venue QR codes that can be used with external QR code generators
 * or internal QR code generation libraries.
 */

/**
 * Generate a URL for a venue QR code
 * This URL can be encoded in a QR code and scanned to auto-check-in to a venue
 * 
 * @param venueId - The venue ID to check in to
 * @param baseUrl - Base URL of the app (defaults to current origin)
 * @returns URL string that can be encoded in QR code
 */
export function generateVenueQRCodeURL(venueId: string, baseUrl?: string): string {
  const url = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${url}/checkin?venueId=${venueId}&source=qr`;
}

/**
 * Get all venue QR code URLs for easy generation
 * Useful for creating multiple QR codes at once
 */
export function getAllVenueQRCodeURLs(baseUrl?: string): Record<string, string> {
  const venues = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const urls: Record<string, string> = {};
  
  venues.forEach(venueId => {
    urls[venueId] = generateVenueQRCodeURL(venueId, baseUrl);
  });
  
  return urls;
}

/**
 * Parse a QR code URL to extract venue ID
 * 
 * @param qrCodeText - The text scanned from QR code
 * @returns venueId if found, null otherwise
 */
export function parseQRCodeVenueId(qrCodeText: string): string | null {
  try {
    // Try parsing as full URL
    if (qrCodeText.includes('http') || qrCodeText.includes('checkin')) {
      const url = new URL(qrCodeText);
      return url.searchParams.get('venueId');
    }
    
    // Try parsing as query string
    if (qrCodeText.includes('venueId=')) {
      const params = new URLSearchParams(qrCodeText);
      return params.get('venueId');
    }
    
    // Try as simple venueId (alphanumeric)
    if (qrCodeText.match(/^[a-zA-Z0-9_-]+$/)) {
      return qrCodeText;
    }
    
    return null;
  } catch {
    // If URL parsing fails, try as simple venueId
    if (qrCodeText.match(/^[a-zA-Z0-9_-]+$/)) {
      return qrCodeText;
    }
    return null;
  }
}

/**
 * Generate QR code image data URL using external service
 * This is a fallback if you don't want to install a QR code library
 * 
 * @param venueId - The venue ID
 * @param baseUrl - Base URL of the app
 * @returns Promise resolving to data URL of QR code image
 */
export async function generateQRCodeImageURL(
  venueId: string, 
  baseUrl?: string
): Promise<string> {
  const qrUrl = generateVenueQRCodeURL(venueId, baseUrl);
  
  // Use external QR code service
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;
}

