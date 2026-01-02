import { APP_CONSTANTS } from '@/constants/app';

export const isMatchExpired = (createdAt: Date) => {
  const now = new Date().getTime();
  const matchTime = createdAt.getTime();
  return now - matchTime > APP_CONSTANTS.MATCH_EXPIRY_MS;
};

export const getMatchTimeRemaining = (createdAt: Date): number => {
  const now = new Date().getTime();
  const matchTime = createdAt.getTime();
  const elapsed = now - matchTime;
  return Math.max(0, APP_CONSTANTS.MATCH_EXPIRY_MS - elapsed);
};

export const formatTimeRemaining = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}; 