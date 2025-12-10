import { IndexMetadata, ComponentDocumentation } from '../types/metadata';

const API_BASE = '/api/metadata';

export async function fetchIndex(): Promise<IndexMetadata> {
  const response = await fetch(`${API_BASE}/index.json`);
  if (!response.ok) {
    throw new Error('Failed to fetch component index');
  }
  return response.json();
}

export async function fetchComponentDoc(componentName: string): Promise<ComponentDocumentation> {
  const response = await fetch(`${API_BASE}/${componentName}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch component: ${componentName}`);
  }
  return response.json();
}
