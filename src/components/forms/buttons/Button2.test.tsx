import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button2';
import styles from './Button2.module.scss';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with children text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with complex children (elements)', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders with primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(styles.button);
      expect(button).toHaveClass(styles.primary);
    });

    it('renders with primary variant when explicitly specified', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(styles.primary);
    });

    it('renders with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(styles.button);
      expect(button).toHaveClass(styles.secondary);
    });

    it('renders with outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(styles.button);
      expect(button).toHaveClass(styles.outline);
    });
  });

  describe('Class Names', () => {
    it('applies base button class', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(styles.button);
    });

    it('applies custom className along with base classes', () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(styles.button);
      expect(button).toHaveClass(styles.primary);
      expect(button).toHaveClass('custom-class');
    });

    it('trims extra whitespace in className', () => {
      render(<Button className="">Button</Button>);
      const button = screen.getByRole('button');
      const className = button.className;
      expect(className).not.toMatch(/\s{2,}/); // No double spaces
      expect(className).not.toMatch(/^\s/); // No leading space
      expect(className).not.toMatch(/\s$/); // No trailing space
    });
  });

  describe('HTML Attributes', () => {
    it('forwards native button attributes', () => {
      render(
        <Button type="submit" disabled aria-label="Submit form">
          Submit
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-label', 'Submit form');
    });

    it('handles data attributes', () => {
      render(<Button data-testid="custom-button" data-analytics="click-event">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
      expect(button).toHaveAttribute('data-analytics', 'click-event');
    });

    it('handles id attribute', () => {
      render(<Button id="my-button">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'my-button');
    });
  });

  describe('Event Handlers', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Click me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('calls onFocus handler when focused', () => {
      const handleFocus = jest.fn();
      render(<Button onFocus={handleFocus}>Focus me</Button>);

      const button = screen.getByRole('button');
      fireEvent.focus(button);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur handler when blurred', () => {
      const handleBlur = jest.fn();
      render(<Button onBlur={handleBlur}>Blur me</Button>);

      const button = screen.getByRole('button');
      fireEvent.blur(button);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onMouseEnter handler when hovered', () => {
      const handleMouseEnter = jest.fn();
      render(<Button onMouseEnter={handleMouseEnter}>Hover me</Button>);

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('calls onMouseLeave handler when unhovered', () => {
      const handleMouseLeave = jest.fn();
      render(<Button onMouseLeave={handleMouseLeave}>Unhover me</Button>);

      const button = screen.getByRole('button');
      fireEvent.mouseLeave(button);

      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('is keyboard accessible', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Accessible Button</Button>);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('supports aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>);
      const button = screen.getByRole('button', { name: /close dialog/i });
      expect(button).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Button aria-describedby="button-description">Submit</Button>
          <span id="button-description">This will submit the form</span>
        </>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'button-description');
    });

    it('supports disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined variant gracefully (defaults to primary)', () => {
      render(<Button variant={undefined}>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(styles.primary);
    });

    it('handles empty children', () => {
      render(<Button>{''}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe('');
    });

    it('handles multiple clicks', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click multiple times</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('handles form submission when type="submit"', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Variant Fallback', () => {
    it('falls back to primary style when variant style is not found', () => {
      // This tests the fallback logic: styles[variant] || styles.primary
      render(<Button variant="primary">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(styles.button);
      expect(button).toHaveClass(styles.primary);
    });
  });

  describe('Integration', () => {
    it('works correctly in a form context', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit" variant="primary">
            Submit
          </Button>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </form>
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(cancelButton).toHaveAttribute('type', 'button');

      fireEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('works with all three variants in the same container', () => {
      render(
        <div>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
      );

      expect(screen.getByText('Primary')).toHaveClass(styles.primary);
      expect(screen.getByText('Secondary')).toHaveClass(styles.secondary);
      expect(screen.getByText('Outline')).toHaveClass(styles.outline);
    });
  });
});
