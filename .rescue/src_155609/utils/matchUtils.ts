export const isMatchExpired = (createdAt: Date) => {
  const now = new Date().getTime();
  const matchTime = createdAt.getTime();
  const threeHours = 3 * 60 * 60 * 1000;
  return now - matchTime > threeHours;
};

export const getMatchTimeRemaining = (createdAt: Date): number => {
  const now = new Date().getTime();
  const matchTime = createdAt.getTime();
  const threeHours = 3 * 60 * 60 * 1000;
  const elapsed = now - matchTime;
  return Math.max(0, threeHours - elapsed);
};

export const formatTimeRemaining = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}; 