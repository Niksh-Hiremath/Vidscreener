import Link from 'next/link';

interface LogoProps {
  className?: string;
  href?: string;
}

export default function Logo({ className = '', href = '/' }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
        <svg 
          className="w-5 h-5 text-white" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </div>
      <span className="text-xl font-bold text-foreground">VidScreener</span>
    </Link>
  );
}
