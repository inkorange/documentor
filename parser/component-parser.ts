import { Project, SyntaxKind, Node, InterfaceDeclaration, TypeAliasDeclaration } from 'ts-morph';
import * as path from 'path';

export interface PropMetadata {
  type: string;
  values?: string[];
  optional: boolean;
  default?: string;
  description?: string;
  renderVariants?: boolean;
  hideInDocs?: boolean;
  exampleValue?: string;
}

export interface ComponentMetadata {
  name: string;
  description: string;
  filePath: string;
  props: Record<string, PropMetadata>;
  styleFiles: string[];
}

export class ComponentParser {
  private project: Project;

  constructor() {
    this.project = new Project({
      compilerOptions: {
        jsx: 1, // JSX preserve
        target: 99, // ESNext
      },
    });
  }

  /**
   * Parse a component file and extract metadata
   */
  async parseComponent(filePath: string): Promise<ComponentMetadata | null> {
    try {
      const sourceFile = this.project.addSourceFileAtPath(filePath);
      const fileName = path.basename(filePath, path.extname(filePath));

      // Find the component interface (e.g., ButtonProps)
      const propsInterface = this.findPropsInterface(sourceFile, fileName);
      if (!propsInterface) {
        console.warn(`⚠️  No props interface found for ${fileName}`);
        return null;
      }

      const props = this.extractProps(propsInterface, sourceFile);

      // Find component description from JSDoc
      const componentFunc = sourceFile.getFunctions().find(f => f.getName() === fileName) ||
                           sourceFile.getVariableDeclaration(fileName);

      const description = this.extractDescription(componentFunc);

      // Find style imports
      const styleFiles = this.findStyleImports(sourceFile);

      return {
        name: fileName,
        description,
        filePath,
        props,
        styleFiles,
      };
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Find the props interface for a component
   */
  private findPropsInterface(sourceFile: any, componentName: string): InterfaceDeclaration | null {
    const propsName = `${componentName}Props`;
    return sourceFile.getInterface(propsName);
  }

  /**
   * Extract prop metadata from interface
   */
  private extractProps(propsInterface: InterfaceDeclaration, sourceFile: any): Record<string, PropMetadata> {
    const props: Record<string, PropMetadata> = {};

    for (const prop of propsInterface.getProperties()) {
      const propName = prop.getName();
      const propType = prop.getType();
      const typeText = prop.getTypeNode()?.getText() || propType.getText();
      const optional = prop.hasQuestionToken();

      // Extract JSDoc comment or leading comments
      const jsDocs = prop.getJsDocs();
      let description = jsDocs[0]?.getDescription().trim() || '';
      let tags: Record<string, string> = {};

      // If no JSDoc, try to get leading comments
      if (!description) {
        const leadingComments = prop.getLeadingCommentRanges();
        if (leadingComments && leadingComments.length > 0) {
          const sourceFileText = prop.getSourceFile().getFullText();
          description = leadingComments
            .map(range => sourceFileText.slice(range.getPos(), range.getEnd()))
            .join('\n')
            .replace(/\/\*\*?|\*\/|\*/g, '')
            .trim();

          // Parse tags from comments
          tags = this.parseTagsFromComments(description);
        }
      } else {
        // Parse JSDoc tags
        tags = this.parseJSDocTags(jsDocs);
      }

      // Check if it's a union type
      const values = this.extractUnionValues(prop.getTypeNode());

      // Try to find default value from component implementation
      const defaultValue = this.findDefaultValue(sourceFile, propName);

      props[propName] = {
        type: typeText,
        values,
        optional,
        default: defaultValue,
        description,
        renderVariants: tags.renderVariants === 'true',
        hideInDocs: tags.hideInDocs === 'true',
        exampleValue: tags.exampleValue,
      };
    }

    return props;
  }

  /**
   * Extract union type values (e.g., 'primary' | 'secondary' | 'outline')
   */
  private extractUnionValues(typeNode: any): string[] | undefined {
    if (!typeNode) return undefined;

    if (typeNode.getKind() === SyntaxKind.UnionType) {
      return typeNode.getTypeNodes().map((t: any) => {
        const text = t.getText();
        return text.replace(/['"]/g, ''); // Remove quotes
      });
    }

    // Check if it's a type reference to a union type
    if (typeNode.getKind() === SyntaxKind.TypeReference) {
      const typeName = typeNode.getTypeName().getText();
      const sourceFile = typeNode.getSourceFile();
      const typeAlias = sourceFile.getTypeAlias(typeName);

      if (typeAlias) {
        const aliasType = typeAlias.getTypeNode();
        if (aliasType && aliasType.getKind() === SyntaxKind.UnionType) {
          return aliasType.getTypeNodes().map((t: any) => {
            const text = t.getText();
            return text.replace(/['"]/g, '');
          });
        }
      }
    }

    return undefined;
  }

  /**
   * Parse JSDoc tags
   */
  private parseJSDocTags(jsDocs: any[]): Record<string, string> {
    const tags: Record<string, string> = {};

    for (const doc of jsDocs) {
      for (const tag of doc.getTags()) {
        const tagName = tag.getTagName();
        const text = tag.getComment() || 'true';
        tags[tagName] = typeof text === 'string' ? text : 'true';
      }
    }

    return tags;
  }

  /**
   * Parse tags from plain comments (not JSDoc)
   * Looks for patterns like "renderVariants: true"
   */
  private parseTagsFromComments(commentText: string): Record<string, string> {
    const tags: Record<string, string> = {};
    const lines = commentText.split('\n');

    for (const line of lines) {
      // Match pattern: "tagName: value" or just "tagName"
      const match = line.match(/(\w+):\s*(.+)/);
      if (match) {
        const [, tagName, value] = match;
        tags[tagName.trim()] = value.trim();
      }
    }

    return tags;
  }

  /**
   * Extract component description from JSDoc
   */
  private extractDescription(node: any): string {
    if (!node || typeof node.getJsDocs !== 'function') return '';

    const jsDocs = node.getJsDocs();
    if (!jsDocs || jsDocs.length === 0) return '';

    return jsDocs[0].getDescription().trim();
  }

  /**
   * Find default prop values in component implementation
   */
  private findDefaultValue(sourceFile: any, propName: string): string | undefined {
    // Look for destructuring defaults in function parameters
    const functions = sourceFile.getFunctions();
    const variables = sourceFile.getVariableDeclarations();

    for (const func of [...functions, ...variables]) {
      const params = func.getParameters?.() || [];
      for (const param of params) {
        const binding = param.getNameNode();
        if (binding && binding.getKind() === SyntaxKind.ObjectBindingPattern) {
          for (const element of binding.getElements()) {
            if (element.getName() === propName && element.getInitializer()) {
              return element.getInitializer()?.getText();
            }
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Find style file imports
   */
  private findStyleImports(sourceFile: any): string[] {
    const styleFiles: string[] = [];
    const imports = sourceFile.getImportDeclarations();

    for (const importDecl of imports) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      if (moduleSpecifier.match(/\.(css|scss|sass|module\.css|module\.scss)$/)) {
        styleFiles.push(moduleSpecifier);
      }
    }

    return styleFiles;
  }
}
