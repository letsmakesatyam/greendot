import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const STATUS_COLORS: Record<string, string> = {
  Evaluate: "bg-orange-100 text-orange-700 border-orange-200",
  Discontinued: "bg-red-100 text-red-700 border-red-200",
  "": "bg-green-100 text-green-700 border-green-200",
};

export const SOURCE_COLORS: Record<string, string> = {
  EU: "bg-blue-100 text-blue-700",
  TR: "bg-purple-100 text-purple-700",
  UAE: "bg-yellow-100 text-yellow-700",
  US: "bg-indigo-100 text-indigo-700",
};

export const APP_TYPE_COLORS: Record<string, string> = {
  Core: "bg-sky-100 text-sky-700",
  Country: "bg-teal-100 text-teal-700",
  Enhanced: "bg-violet-100 text-violet-700",
  Specialty: "bg-pink-100 text-pink-700",
};
