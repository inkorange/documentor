/**
 * Component Registry
 *
 * This file serves as a central registry for all components that should be
 * available for live preview in the documentation site.
 *
 * To add a new component to the documentation:
 * 1. Import the component
 * 2. Add it to the componentRegistry object with its name as the key
 */

import React from 'react';

// Import components from the source directory
// Note: These imports assume the components are available in the build
// You may need to adjust paths based on your build configuration

export interface ComponentRegistryEntry {
  component: React.ComponentType<any>;
  displayName: string;
}

/**
 * Registry of all components available for documentation and live preview
 * Key: Component name (must match the name in metadata)
 * Value: The actual React component
 */
export const componentRegistry: Record<string, ComponentRegistryEntry> = {
  // Add your components here as they become available
  // Example:
  // Button: {
  //   component: Button,
  //   displayName: 'Button'
  // },
};

/**
 * Get a component from the registry by name
 */
export function getComponent(name: string): React.ComponentType<any> | null {
  const entry = componentRegistry[name];
  return entry ? entry.component : null;
}

/**
 * Check if a component is registered
 */
export function isComponentRegistered(name: string): boolean {
  return name in componentRegistry;
}

/**
 * Get all registered component names
 */
export function getRegisteredComponentNames(): string[] {
  return Object.keys(componentRegistry);
}
