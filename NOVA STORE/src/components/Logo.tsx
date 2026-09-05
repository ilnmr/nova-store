import React from 'react';

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg 
      className={`w-10 h-10 ${className}`} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="20" className="fill-primary" />
      <path 
        d="M 30 70 L 30 30 L 70 70 L 70 30" 
        stroke="currentColor" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-primary-foreground"
      />
      <path 
        d="M 70 30 C 50 10, 30 50, 70 70 C 90 90, 50 110, 30 70" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        className="text-accent-foreground opacity-50"
      />
    </svg>
  );
}
