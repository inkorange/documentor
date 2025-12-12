import React from 'react';
import styles from './Button2.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
    * Controls the display variant of the button component
    * @renderVariants true
    * @displayTemplate {variant} Button
   */
  variant?: ButtonVariant;
  /* content for the button text */
  children: React.ReactNode;
}

/**
 * Button component that supports multiple variants. This is the example
 * of the summary that can be added for these. Can I use code
 * snippets ike this? `<Button />`
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
