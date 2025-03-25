
export interface ContactInfo {
  type: 'phone' | 'instagram' | 'snapchat' | 'custom';
  value: string;
  sharedBy: string;
  sharedAt: string;
}
