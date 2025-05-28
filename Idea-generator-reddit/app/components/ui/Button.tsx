import React from 'react';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  disabled = false, 
  loading = false, 
  children, 
  variant = 'primary',
  className = ''
}) => {
  const baseClasses = "px-8 py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-green-600 to-lime-600 text-white hover:from-green-700 hover:to-lime-700 hover:shadow-green-500/25",
    secondary: "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button; 