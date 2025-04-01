// Import only once from both libraries
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Define the cn function once
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}