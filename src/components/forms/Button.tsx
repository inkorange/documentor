import React from 'react';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /* Controls the display variant of the button component */
  /* renderVariants: true */
  variant?: ButtonVariant;
  /* content for the button text */
  children: React.ReactNode;
}

/**
 * Button component that supports multiple variants.
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const variantClass = styles[variant] || styles.primary;
  const buttonClasses = `${styles.button} ${variantClass} ${className}`.trim();

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
