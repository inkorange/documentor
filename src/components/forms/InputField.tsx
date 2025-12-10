import React from 'react';
import styles from './InputField.module.scss';

export type InputFieldVariant = 'default' | 'success' | 'error' | 'warning';
export type InputFieldSize = 'small' | 'medium' | 'large';

export interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Visual variant of the input field
   * @renderVariants true
   */
  variant?: InputFieldVariant;

  /**
   * Size of the input field
   * @renderVariants true
   */
  size?: InputFieldSize;

  /**
   * Label text displayed above the input
   */
  label?: string;

  /**
   * Helper text displayed below the input
   */
  helperText?: string;

  /**
   * Error message to display (overrides helperText when present)
   */
  errorMessage?: string;

  /**
   * Whether the input field is in an error state
   */
  hasError?: boolean;

  /**
   * Icon to display on the left side of the input
   * @hideInDocs
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display on the right side of the input
   * @hideInDocs
   */
  rightIcon?: React.ReactNode;

  /**
   * Whether the input field is required
   */
  required?: boolean;

  /**
   * Whether the input is full width
   */
  fullWidth?: boolean;
}

/**
 * InputField component - A flexible, accessible input field primitive with multiple variants and sizes.
 * Designed to be a standalone component for form inputs with built-in validation states.
 *
 * @example
 * <InputField
 *   label="Email Address"
 *   type="email"
 *   placeholder="Enter your email"
 *   variant="default"
 *   size="medium"
 * />
 */
const InputField: React.FC<InputFieldProps> = ({
  variant = 'default',
  size = 'medium',
  label,
  helperText,
  errorMessage,
  hasError = false,
  leftIcon,
  rightIcon,
  required = false,
  fullWidth = false,
  className = '',
  disabled = false,
  ...props
}) => {
  const inputClasses = [
    styles.input,
    styles[variant],
    styles[size],
    leftIcon && styles.hasLeftIcon,
    rightIcon && styles.hasRightIcon,
    (hasError || errorMessage) && styles.error,
    disabled && styles.disabled,
    fullWidth && styles.fullWidth,
    className
  ].filter(Boolean).join(' ');

  const wrapperClasses = [
    styles.wrapper,
    fullWidth && styles.fullWidth
  ].filter(Boolean).join(' ');

  const displayError = hasError || errorMessage;
  const displayMessage = errorMessage || helperText;

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles.inputWrapper}>
        {leftIcon && (
          <span className={styles.leftIcon}>{leftIcon}</span>
        )}

        <input
          className={inputClasses}
          disabled={disabled}
          required={required}
          aria-invalid={displayError ? 'true' : 'false'}
          aria-describedby={displayMessage ? 'input-message' : undefined}
          {...props}
        />

        {rightIcon && (
          <span className={styles.rightIcon}>{rightIcon}</span>
        )}
      </div>

      {displayMessage && (
        <span
          id="input-message"
          className={displayError ? styles.errorMessage : styles.helperText}
        >
          {displayMessage}
        </span>
      )}
    </div>
  );
};

export default InputField;
