# Writing Documentable Components

This guide explains how to write React components that work seamlessly with DocSpark's automatic documentation generation. Learn how to use JSDoc tags, structure your components, and document CSS variables for rich, interactive documentation.

## Table of Contents

- [Component Structure](#component-structure)
- [JSDoc Tags Reference](#jsdoc-tags-reference)
- [Prop Documentation](#prop-documentation)
- [Component Documentation](#component-documentation)
- [CSS Variables Documentation](#css-variables-documentation)
- [TypeScript Types](#typescript-types)
- [Best Practices](#best-practices)
- [Complete Examples](#complete-examples)

---

## Component Structure

DocSpark works with standard React TypeScript components that follow a specific structure:

### Required Structure

1. **Component interface/props** - Named `{ComponentName}Props`
2. **Component function/variable** - Named the same as your file
3. **Default export** - Export your component as default

### Basic Example

```typescript
// src/components/Button.tsx
import React from 'react';
import styles from './Button.module.scss';

// 1. Props interface (must be named {ComponentName}Props)
export interface ButtonProps {
  /** Button text */
  children: React.ReactNode;

  /** Visual style variant */
  variant?: 'primary' | 'secondary';
}

// 2. Component function (name matches file)
const Button: React.FC<ButtonProps> = ({ children, variant = 'primary' }) => {
  return <button className={styles[variant]}>{children}</button>;
};

// 3. Default export
export default Button;
```

**How DocSpark finds your component:**
1. Looks for a file (e.g., `Button.tsx`)
2. Finds the props interface (`ButtonProps`)
3. Finds the component function/variable (`Button`)
4. Extracts all metadata from JSDoc comments

---

## JSDoc Tags Reference

DocSpark uses JSDoc tags to control how documentation is generated. All tags are optional and extend standard JSDoc syntax.

### `@renderVariants`

**Purpose:** Generate multiple documentation examples for different prop values

**Type:** `boolean` (use `true` or `false`)

**How it works:** When set to `true`, DocSpark creates a separate example for each value in a union type, allowing users to see all variations of your component.

**Example:**
```typescript
export interface ButtonProps {
  /**
   * Visual style of the button
   * @renderVariants true
   */
  variant?: 'primary' | 'secondary' | 'outline';
}
```

**Result:** Generates 3 separate examples:
- Variant: primary
- Variant: secondary
- Variant: outline

**Without `@renderVariants`:**
Only one example would be generated with the default value.

---

### `@displayTemplate`

**Purpose:** Customize the titles/labels for generated variants

**Type:** `string` (template with `{propName}` placeholders)

**How it works:** Defines a template string where `{propName}` gets replaced with actual prop values. Use this to create meaningful, readable variant titles.

**Example:**
```typescript
export interface ButtonProps {
  /**
   * Button size
   * @renderVariants true
   * @displayTemplate {size} Button
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Visual style
   * @renderVariants true
   */
  variant?: 'primary' | 'secondary';
}
```

**Result:** Generates titles like:
- "Small Button"
- "Medium Button"
- "Large Button"

**Advanced template with multiple props:**
```typescript
/**
 * @renderVariants true
 * @displayTemplate {size} {variant} Button
 */
```

**Result:** Generates titles like:
- "Small Primary Button"
- "Large Secondary Button"

**Default behavior (without `@displayTemplate`):**
Uses prop name and value: "variant: primary", "size: small"

---

### `@hideInDocs`

**Purpose:** Hide internal or testing props from documentation

**Type:** `boolean` (use `true`)

**How it works:** Props marked with `@hideInDocs` are excluded from the props table and variant generation, but remain functional in your component.

**Example:**
```typescript
export interface ButtonProps {
  /** Button text visible to users */
  children: React.ReactNode;

  /**
   * Internal test identifier for E2E tests
   * @hideInDocs
   */
  _testId?: string;

  /**
   * Internal callback for analytics
   * @hideInDocs
   */
  _onClickTracking?: () => void;
}
```

**Result:**
- Only `children` appears in documentation
- `_testId` and `_onClickTracking` are hidden but still type-safe

**Use cases:**
- Internal testing props (`_testId`, `data-testid`)
- Analytics callbacks
- Debug props
- Deprecated props (also consider `@deprecated`)
- Props used only by parent components

---

### `@example`

**Purpose:** Provide example values for props in generated variants

**Type:** `string` (the example value)

**How it works:** Overrides the default value used when generating component examples. Particularly useful for string props where you want to show meaningful examples.

**Example:**
```typescript
export interface CardProps {
  /**
   * Card title text
   * @example "Welcome to DocSpark"
   */
  title?: string;

  /**
   * Card description
   * @example "Build beautiful component documentation with ease"
   */
  description?: string;

  /**
   * Number of items to display
   * @example 5
   */
  count?: number;
}
```

**Result:** Generated examples use these values instead of generic defaults:
- `title`: "Welcome to DocSpark" (instead of "Example text")
- `description`: "Build beautiful component documentation..." (instead of "Example text")
- `count`: 5 (instead of 42)

**Type-specific defaults (without `@example`):**
- `string`: "Example text"
- `number`: 42
- `children`: "Button Text"
- `boolean`: toggles between true/false

---

### `@variantExclude`

**Purpose:** Prevent incompatible prop combinations in generated variant permutations

**Type:** `string` (space or comma-separated list of prop names)

**How it works:** When DocSpark generates variant permutations (combinations of multiple props), it uses this tag to avoid creating invalid or nonsensical combinations. This is particularly useful for props that shouldn't be used together.

**Example:**
```typescript
export interface ButtonProps {
  /**
   * Visual style variant
   * @renderVariants true
   */
  variant?: 'primary' | 'secondary' | 'tertiary';

  /**
   * Loading state indicator
   * @renderVariants true
   * @variantExclude disabled
   */
  loading?: boolean;

  /**
   * Disables the button
   * @renderVariants true
   * @variantExclude loading
   */
  disabled?: boolean;
}
```

**Result:**
- DocSpark will NOT generate variants that combine `loading` and `disabled` together
- Each prop can still have individual variants
- Prevents confusing documentation examples like "loading disabled button"

**Use cases:**
- Mutually exclusive states (`loading` / `disabled`)
- Incompatible visual styles
- Props that override each other
- Combinations that don't make semantic sense

**Multiple exclusions:**
```typescript
/**
 * Icon-only button variant
 * @renderVariants true
 * @variantExclude loading disabled
 */
iconOnly?: boolean;
```

---

### `@compositionPattern`

**Purpose:** Document how compound components work together

**Type:** `string` (description of the composition pattern)

**How it works:** For components that follow the compound component pattern (like `Select.Option`, `Tabs.Tab`, etc.), this tag documents the relationship and usage pattern. DocSpark automatically detects sub-components and displays this information prominently.

**Example:**
```typescript
/**
 * Dropdown select component with composable options
 *
 * @compositionPattern Use Select as the parent with Select.Option children to create dropdown menus. Select.Group can be used to organize options into sections.
 */
const Select: React.FC<SelectProps> = ({ children, ...props }) => {
  return <div className={styles.select}>{children}</div>;
};

// Sub-components
Select.Option = SelectOption;
Select.Group = SelectGroup;

export default Select;
```

**Result:**
- A "Component Composition" panel appears on the documentation page
- Shows the pattern description
- Lists all sub-components (`Select.Option`, `Select.Group`)
- Helps users understand the component API

**Auto-detection:**
DocSpark automatically detects sub-components assigned as properties:
```typescript
Component.SubComponent = SubComponentImplementation;
```

If no `@compositionPattern` is provided but sub-components are detected, DocSpark generates a default description like:
> "Compound component with 2 sub-components: Select.Option, Select.Group"

**Advanced example:**
```typescript
/**
 * Tab navigation component
 *
 * @compositionPattern Tabs serves as the container with Tabs.Tab for individual tabs and Tabs.Panel for content. The active tab is controlled via the `activeTab` prop on the parent Tabs component.
 */
const Tabs: React.FC<TabsProps> = ({ activeTab, children }) => {
  return (
    <div className={styles.tabs}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { active: child.props.id === activeTab })
      )}
    </div>
  );
};

Tabs.Tab = Tab;
Tabs.Panel = TabPanel;
```

**Use cases:**
- Navigation components (`Tabs.Tab`, `Menu.Item`)
- Form components (`Form.Field`, `Form.Section`)
- Layout components (`Card.Header`, `Card.Body`, `Card.Footer`)
- List components (`List.Item`, `List.Header`)
- Any component following the compound component pattern

---

### Standard JSDoc Tags

DocSpark also supports standard JSDoc tags that are commonly used:

#### `@deprecated`

Mark props as deprecated (DocSpark shows a warning):

```typescript
export interface ButtonProps {
  /**
   * Button color
   * @deprecated Use `variant` prop instead
   */
  color?: string;

  /** Preferred way to style button */
  variant?: 'primary' | 'secondary';
}
```

#### `@default`

Document default values (for documentation purposes):

```typescript
export interface ButtonProps {
  /**
   * Button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
}
```

**Note:** DocSpark automatically detects defaults from your component implementation, so this is optional.

---

## Prop Documentation

### Writing Good Prop Descriptions

Prop descriptions appear in the props table. Write clear, concise descriptions:

**Good examples:**
```typescript
export interface ButtonProps {
  /** Button label text */
  children: React.ReactNode;

  /** Disables the button and prevents interaction */
  disabled?: boolean;

  /** Click event handler */
  onClick?: () => void;

  /** Visual size of the button */
  size?: 'small' | 'medium' | 'large';
}
```

**Avoid:**
```typescript
export interface ButtonProps {
  /** The children */ // Too vague
  children: React.ReactNode;

  /** Disabled */ // Not descriptive enough
  disabled?: boolean;

  /** onClick prop */ // Restates the obvious
  onClick?: () => void;
}
```

### Multi-line Descriptions

For complex props, use multi-line JSDoc comments:

```typescript
export interface FormProps {
  /**
   * Form submission handler
   *
   * Called when the form is submitted with valid data.
   * Receives the form data as a structured object.
   * Should return a Promise that resolves on success.
   */
  onSubmit?: (data: FormData) => Promise<void>;
}
```

### Union Types

DocSpark automatically detects and displays union type values:

```typescript
export interface AlertProps {
  /**
   * Alert severity level
   * Controls the color and icon displayed
   */
  severity?: 'info' | 'warning' | 'error' | 'success';
}
```

**Result:** Props table shows all possible values: `'info' | 'warning' | 'error' | 'success'`

### Type References

You can reference external types:

```typescript
// types.ts
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonVariant = 'primary' | 'secondary' | 'outline';

// Button.tsx
import { ButtonSize, ButtonVariant } from './types';

export interface ButtonProps {
  /** Button size */
  size?: ButtonSize;

  /** Visual style */
  variant?: ButtonVariant;
}
```

DocSpark resolves type aliases and displays the actual values.

---

## Component Documentation

Document the component itself with JSDoc comments above the component function or variable:

```typescript
/**
 * Primary button component for user actions
 *
 * Supports multiple variants, sizes, and states.
 * Use primary variant for main actions, secondary for less important actions.
 */
const Button: React.FC<ButtonProps> = ({ children, variant = 'primary' }) => {
  return <button className={styles[variant]}>{children}</button>;
};
```

**Where it appears:** Component description shows at the top of the documentation page.

### Component Naming

Components must be named consistently:

```typescript
//  Good - File: Button.tsx
export interface ButtonProps { ... }
const Button: React.FC<ButtonProps> = ...
export default Button;

//  Good - File: InputField.tsx
export interface InputFieldProps { ... }
const InputField: React.FC<InputFieldProps> = ...
export default InputField;

// L Bad - Names don't match
export interface ButtonProps { ... }
const MyButton: React.FC<ButtonProps> = ... // Wrong name
```

---

## CSS Variables Documentation

Document CSS custom properties (CSS variables) used in your component styles. DocSpark automatically parses and displays them.

### Basic CSS Variable Documentation

In your CSS/SCSS files, document variables in a comment block:

```scss
// Button.module.scss

/**
 * CSS Variables:
 * --button-primary-bg: Primary button background color
 * --button-primary-text: Primary button text color
 * --button-secondary-bg: Secondary button background color
 * --button-secondary-text: Secondary button text color
 * --button-border-radius: Button corner radius
 * --button-padding-x: Horizontal padding
 * --button-padding-y: Vertical padding
 */

.button {
  padding: var(--button-padding-y, 0.75rem) var(--button-padding-x, 1.5rem);
  border-radius: var(--button-border-radius, 0.375rem);
  font-weight: 600;
  transition: all 0.2s;
}

.primary {
  background-color: var(--button-primary-bg, #0066cc);
  color: var(--button-primary-text, #ffffff);
}

.secondary {
  background-color: var(--button-secondary-bg, #6b7280);
  color: var(--button-secondary-text, #ffffff);
}
```

### Documentation Format

Each variable must follow this format in the comment:

```
--variable-name: Description of what this variable controls
```

**How DocSpark parses it:**
1. Finds comment block with `CSS Variables:`
2. Extracts each line starting with `--`
3. Splits on `:` to get name and description
4. Displays in a table on the component page

### Multiple Documentation Blocks

You can have multiple documentation blocks:

```scss
/**
 * CSS Variables:
 * --card-bg: Card background color
 * --card-border: Card border color
 */
.card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #e5e7eb);
}

/**
 * CSS Variables:
 * --card-title-color: Title text color
 * --card-title-size: Title font size
 */
.card-title {
  color: var(--card-title-color, #1f2937);
  font-size: var(--card-title-size, 1.5rem);
}
```

### Default Values

Always provide fallback values in your CSS:

```scss
/*  Good - Has fallback */
.button {
  background: var(--button-bg, #0066cc);
}

/* L Avoid - No fallback */
.button {
  background: var(--button-bg);
}
```

Fallbacks ensure your component works even if custom variables aren't defined.

---

## TypeScript Types

### Recommended Type Patterns

**Union types for variants:**
```typescript
export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}
```

**Enums (less recommended):**
```typescript
// Works but union types are preferred
export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Outline = 'outline'
}
```

**Complex types:**
```typescript
export interface CardProps {
  /** Card title */
  title: string;

  /** Card image configuration */
  image?: {
    src: string;
    alt: string;
  };

  /** List of action buttons */
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}
```

### Optional vs Required Props

Use `?` for optional props:

```typescript
export interface FormFieldProps {
  /** Field label (required) */
  label: string;

  /** Field placeholder (optional) */
  placeholder?: string;

  /** Help text (optional) */
  helpText?: string;
}
```

---

## Best Practices

### 1. Use Meaningful Descriptions

Write descriptions that explain purpose and behavior:

```typescript
//  Good
/**
 * Controls whether the modal can be closed by clicking outside
 * @default true
 */
closeOnOutsideClick?: boolean;

// L Bad
/**
 * Close on outside click
 */
closeOnOutsideClick?: boolean;
```

### 2. Document Complex Props

For complex object/function props, explain parameters:

```typescript
/**
 * Validation function for form input
 *
 * Receives the current input value and should return true if valid,
 * or an error message string if invalid.
 *
 * @example (value) => value.length > 0 || "Field is required"
 */
validate?: (value: string) => boolean | string;
```

### 3. Use `@renderVariants` Strategically

Only use on props that create visually different variations:

```typescript
export interface AlertProps {
  /**
   * Alert severity level
   * @renderVariants true
   * @displayTemplate {severity} Alert
   */
  severity?: 'info' | 'warning' | 'error' | 'success'; //  Good - visual differences

  /**
   * Alert message
   */
  message: string; //  Good - no @renderVariants (would create too many variants)
}
```

### 4. Hide Internal Props

Keep documentation clean by hiding implementation details:

```typescript
export interface ComponentProps {
  // Public API
  /** User-visible label */
  label: string;

  // Internal props
  /**
   * @hideInDocs
   */
  _internalState?: any;

  /**
   * @hideInDocs
   */
  _renderKey?: string;
}
```

### 5. Provide Meaningful Examples

Use realistic examples that demonstrate actual use cases:

```typescript
export interface UserCardProps {
  /**
   * User's full name
   * @example "Jane Smith"
   */
  name: string;

  /**
   * User's job title
   * @example "Senior Software Engineer"
   */
  title?: string;

  /**
   * User's email address
   * @example "jane.smith@example.com"
   */
  email?: string;
}
```

### 6. Document CSS Variables Comprehensively

List all themeable variables:

```scss
/**
 * CSS Variables:
 * --input-bg: Background color
 * --input-border: Border color
 * --input-border-focus: Border color when focused
 * --input-text: Text color
 * --input-placeholder: Placeholder text color
 * --input-radius: Border radius
 * --input-padding: Internal padding
 * --input-error-border: Border color for error state
 * --input-error-text: Text color for error message
 */
```

---

## Complete Examples

### Simple Button Component

```typescript
// src/components/Button.tsx
import React from 'react';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  /**
   * Button label text
   * @example "Click Me"
   */
  children: React.ReactNode;

  /**
   * Visual style variant
   * @renderVariants true
   * @displayTemplate {variant} Button
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @renderVariants true
   */
  size?: ButtonSize;

  /**
   * Disables the button and prevents interaction
   */
  disabled?: boolean;

  /**
   * Click event handler
   */
  onClick?: () => void;

  /**
   * Internal test identifier
   * @hideInDocs
   */
  _testId?: string;
}

/**
 * Primary button component for user actions
 *
 * Supports multiple variants (primary, secondary, outline) and sizes.
 * Use primary variant for main call-to-action buttons.
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  _testId
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      disabled={disabled}
      onClick={onClick}
      data-testid={_testId}
    >
      {children}
    </button>
  );
};

export default Button;
```

```scss
// Button.module.scss

/**
 * CSS Variables:
 * --button-primary-bg: Primary button background color
 * --button-primary-text: Primary button text color
 * --button-secondary-bg: Secondary button background color
 * --button-secondary-text: Secondary button text color
 * --button-outline-border: Outline button border color
 * --button-outline-text: Outline button text color
 * --button-radius: Button border radius
 * --button-padding-sm: Small button padding
 * --button-padding-md: Medium button padding
 * --button-padding-lg: Large button padding
 */

.button {
  border: none;
  border-radius: var(--button-radius, 0.375rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.primary {
  background: var(--button-primary-bg, #0066cc);
  color: var(--button-primary-text, #ffffff);
}

.secondary {
  background: var(--button-secondary-bg, #6b7280);
  color: var(--button-secondary-text, #ffffff);
}

.outline {
  background: transparent;
  border: 2px solid var(--button-outline-border, #0066cc);
  color: var(--button-outline-text, #0066cc);
}

.small {
  padding: var(--button-padding-sm, 0.5rem 1rem);
  font-size: 0.875rem;
}

.medium {
  padding: var(--button-padding-md, 0.75rem 1.5rem);
  font-size: 1rem;
}

.large {
  padding: var(--button-padding-lg, 1rem 2rem);
  font-size: 1.125rem;
}
```

### Complex Form Component

```typescript
// src/components/InputField.tsx
import React from 'react';
import styles from './InputField.module.scss';

export type InputType = 'text' | 'email' | 'password' | 'number';
export type InputSize = 'small' | 'medium' | 'large';

export interface InputFieldProps {
  /**
   * Field label text
   * @example "Email Address"
   */
  label: string;

  /**
   * Input type
   * @renderVariants true
   */
  type?: InputType;

  /**
   * Input size
   * @renderVariants true
   * @displayTemplate {size} Input Field
   */
  size?: InputSize;

  /**
   * Placeholder text shown when empty
   * @example "Enter your email"
   */
  placeholder?: string;

  /**
   * Help text displayed below the input
   * @example "We'll never share your email"
   */
  helpText?: string;

  /**
   * Error message to display
   * Shows red border and error text when set
   * @example "Please enter a valid email address"
   */
  error?: string;

  /**
   * Makes the field required
   */
  required?: boolean;

  /**
   * Disables the input field
   */
  disabled?: boolean;

  /**
   * Current input value
   */
  value?: string;

  /**
   * Value change handler
   */
  onChange?: (value: string) => void;

  /**
   * Input blur handler
   */
  onBlur?: () => void;
}

/**
 * Flexible input field component with validation support
 *
 * Supports various input types, sizes, and states.
 * Includes built-in error handling and help text display.
 */
const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  size = 'medium',
  placeholder,
  helpText,
  error,
  required = false,
  disabled = false,
  value,
  onChange,
  onBlur
}) => {
  return (
    <div className={styles.container}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      <input
        type={type}
        className={`${styles.input} ${styles[size]} ${error ? styles.error : ''}`}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
      />

      {error && <p className={styles.errorText}>{error}</p>}
      {!error && helpText && <p className={styles.helpText}>{helpText}</p>}
    </div>
  );
};

export default InputField;
```

---

## Summary

### Quick Reference

**JSDoc Tags:**
- `@renderVariants true` - Generate examples for each prop value
- `@displayTemplate {prop} Text` - Customize variant titles
- `@hideInDocs` - Hide internal props
- `@example "value"` - Provide example values
- `@variantExclude propName` - Prevent prop combinations in permutations
- `@compositionPattern description` - Document compound component patterns
- `@deprecated` - Mark as deprecated
- `@default value` - Document default value (automatically inferred from code)

**Component Structure:**
1. Props interface named `{ComponentName}Props`
2. Component function/variable named same as file
3. Default export
4. JSDoc comments for all public props

**CSS Variables:**
- Document in `/** CSS Variables: */` comment blocks
- Format: `--var-name: Description`
- Always provide fallback values

For more information, see:
- [Configuration Guide](./CONFIGURATION.md)
- [README](./README.md)
