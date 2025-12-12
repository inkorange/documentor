import { Project, SyntaxKind, Node, InterfaceDeclaration, TypeAliasDeclaration } from 'ts-morph';
import * as path from 'path';

export interface PropMetadata {
  type: string;
  values?: string[];
  optional: boolean;
  default?: string;
  description?: string;
  renderVariants?: boolean;
  displayTemplate?: string;
  hideInDocs?: boolean;
  example?: string;
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

      const props = this.extractProps(propsInterface, sourceFile, fileName);

      // Find component description from JSDoc
      const description = this.extractComponentDescription(sourceFile, fileName);

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
    // Try to find interface with filename pattern (e.g., Button2Props for Button2.tsx)
    const fileBasedPropsName = `${componentName}Props`;
    let propsInterface = sourceFile.getInterface(fileBasedPropsName);

    if (propsInterface) {
      return propsInterface;
    }

    // If not found, try to find the actual component and infer the props interface
    // Look for default export or named export matching the filename
    const componentVar = sourceFile.getVariableDeclaration(componentName);
    const defaultExport = sourceFile.getDefaultExportSymbol();

    // If there's a default export, try to find its props type
    if (defaultExport) {
      const declaration = defaultExport.getDeclarations()[0];
      if (declaration) {
        // Try to get the type from the declaration
        const componentVarDecl = sourceFile.getVariableDeclarations().find((v: any) => {
          return v.getType().getText().includes('Props');
        });

        if (componentVarDecl) {
          const typeText = componentVarDecl.getType().getText();
          // Extract props interface name from FC<PropsName> or React.FC<PropsName>
          const match = typeText.match(/FC<(\w+)>/);
          if (match) {
            propsInterface = sourceFile.getInterface(match[1]);
            if (propsInterface) {
              return propsInterface;
            }
          }
        }
      }
    }

    // Fallback: Find any interface ending with "Props"
    const allInterfaces = sourceFile.getInterfaces();
    const propsInterfaces = allInterfaces.filter((iface: any) =>
      iface.getName().endsWith('Props')
    );

    if (propsInterfaces.length === 1) {
      return propsInterfaces[0];
    }

    return null;
  }

  /**
   * Extract component description from JSDoc comments
   * Flexible approach that handles various component patterns
   */
  private extractComponentDescription(sourceFile: any, fileName: string): string {
    const visitedVars = new Set<string>();

    /**
     * Recursively follow variable references to find JSDoc description
     */
    const followVariableChain = (varDecl: any, depth: number = 0): string => {
      if (depth > 10 || !varDecl) return '';

      const varName = varDecl.getName();
      if (visitedVars.has(varName)) return '';
      visitedVars.add(varName);

      // Try variable statement (where JSDoc usually is)
      const varStatement = varDecl.getParent()?.getParent();
      if (varStatement) {
        const desc = this.extractDescription(varStatement);
        if (desc) return desc;
      }

      // Try the variable declaration itself
      const desc = this.extractDescription(varDecl);
      if (desc) return desc;

      // Follow initializer
      const initializer = varDecl.getInitializer();
      if (!initializer) return '';

      const initKind = initializer.getKindName();

      // Simple reference: const X = Y
      if (initKind === 'Identifier') {
        const refVar = sourceFile.getVariableDeclaration(initializer.getText());
        return refVar ? followVariableChain(refVar, depth + 1) : '';
      }

      // Function call: React.memo(...), forwardRef(...), etc.
      if (initKind === 'CallExpression') {
        const args = (initializer as any).getArguments();
        if (args && args.length > 0) {
          const firstArg = args[0];

          // Arg is identifier reference
          if (firstArg.getKindName() === 'Identifier') {
            const argVar = sourceFile.getVariableDeclaration(firstArg.getText());
            if (argVar) return followVariableChain(argVar, depth + 1);
          }

          // Arg is inline function - check call parent for JSDoc
          if (firstArg.getKindName() === 'ArrowFunction' || firstArg.getKindName() === 'FunctionExpression') {
            const callParent = initializer.getParent()?.getParent();
            if (callParent) {
              const callDesc = this.extractDescription(callParent);
              if (callDesc) return callDesc;
            }
          }
        }
      }

      return '';
    };

    // Strategy 1: Exact filename match (variable)
    const componentVar = sourceFile.getVariableDeclaration(fileName);
    if (componentVar) {
      const desc = followVariableChain(componentVar);
      if (desc) return desc;
    }

    // Strategy 2: Exact filename match (function)
    const componentFunc = sourceFile.getFunctions().find((f: any) => f.getName() === fileName);
    if (componentFunc) {
      const desc = this.extractDescription(componentFunc);
      if (desc) return desc;
    }

    // Strategy 3: Default export
    const defaultExport = sourceFile.getDefaultExportSymbol();
    if (defaultExport) {
      const declarations = defaultExport.getDeclarations();
      if (declarations && declarations.length > 0) {
        for (const declaration of declarations) {
          // Export assignment (export default X)
          if (declaration.getKindName() === 'ExportAssignment') {
            const expression = (declaration as any).getExpression?.();
            if (expression && expression.getKindName() === 'Identifier') {
              const exportedVar = sourceFile.getVariableDeclaration(expression.getText());
              if (exportedVar) {
                const desc = followVariableChain(exportedVar);
                if (desc) return desc;
              }
            }
          }

          // Check declaration itself
          const varStatement = declaration.getParent()?.getParent();
          if (varStatement) {
            const desc = this.extractDescription(varStatement);
            if (desc) return desc;
          }
        }
      }
    }

    // Strategy 4: Find all potential component variables
    const allVars = sourceFile.getVariableDeclarations();
    const candidates: Array<{ varDecl: any; desc: string; priority: number }> = [];

    for (const varDecl of allVars) {
      if (visitedVars.has(varDecl.getName())) continue;

      const varName = varDecl.getName();
      const typeText = varDecl.getType().getText();

      // Check if it looks like a component
      const isComponentType = typeText.includes('FC<') ||
                             typeText.includes('React.FC<') ||
                             typeText.includes('FunctionComponent') ||
                             typeText.includes('ForwardRefExoticComponent') ||
                             typeText.includes('MemoExoticComponent') ||
                             typeText.includes('NamedExoticComponent') ||
                             typeText.includes('ExoticComponent');

      const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(varName);
      const hasJSDocLikeComment = varDecl.getParent()?.getParent()?.getLeadingCommentRanges()?.length > 0;

      if (isComponentType || (isPascalCase && hasJSDocLikeComment)) {
        const desc = followVariableChain(varDecl);
        if (desc) {
          // Priority: longer descriptions, PascalCase names, component types
          let priority = desc.length;
          if (isPascalCase) priority += 100;
          if (isComponentType) priority += 50;
          if (varName.toLowerCase().includes(fileName.toLowerCase())) priority += 200;

          candidates.push({ varDecl, desc, priority });
        }
      }
    }

    // Return highest priority description
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.priority - a.priority);
      return candidates[0].desc;
    }

    return '';
  }

  /**
   * Extract prop metadata from interface
   */
  private extractProps(propsInterface: InterfaceDeclaration, sourceFile: any, fileName: string): Record<string, PropMetadata> {
    const props: Record<string, PropMetadata> = {};

    // First, collect props from extended interfaces (excluding React/HTML element types)
    const extendedProps = this.extractPropsFromExtends(propsInterface, sourceFile, fileName);
    Object.assign(props, extendedProps);

    // Then add/override with props defined directly on this interface
    for (const prop of propsInterface.getProperties()) {
      const propName = prop.getName();
      const propType = prop.getType();
      const typeText = prop.getTypeNode()?.getText() || propType.getText();
      const optional = prop.hasQuestionToken();

      // Extract JSDoc comment or leading comments
      const jsDocs = prop.getJsDocs();
      let description = jsDocs[0]?.getDescription().trim() || '';
      let tags: Record<string, string> = {};

      // If JSDoc exists, parse its tags (even if description is empty)
      if (jsDocs && jsDocs.length > 0) {
        tags = this.parseJSDocTags(jsDocs);
      } else {
        // If no JSDoc, try to get leading comments
        const leadingComments = prop.getLeadingCommentRanges();
        if (leadingComments && leadingComments.length > 0) {
          const sourceFileText = prop.getSourceFile().getFullText();
          const commentText = leadingComments
            .map(range => sourceFileText.slice(range.getPos(), range.getEnd()))
            .join('\n')
            .replace(/\/\*\*?|\*\/|\*/g, '')
            .trim();

          // Parse tags from comments using @ syntax
          tags = this.parseTagsFromComments(commentText);

          // Use comment text as description if no tags were found
          if (Object.keys(tags).length === 0) {
            description = commentText;
          }
        }
      }

      // Check if it's a union type
      const values = this.extractUnionValues(prop.getTypeNode());

      // Try to find default value from component implementation
      const componentFunc = sourceFile.getFunctions().find((f: any) => f.getName() === fileName);
      const componentVar = sourceFile.getVariableDeclaration(fileName);
      const componentNode = componentFunc || componentVar;
      const defaultValue = this.findDefaultValue(componentNode, propName);

      props[propName] = {
        type: typeText,
        values,
        optional,
        default: defaultValue,
        description,
        renderVariants: tags.renderVariants === 'true',
        displayTemplate: tags.displayTemplate,
        hideInDocs: tags.hideInDocs === 'true',
        example: tags.example,
      };
    }

    return props;
  }

  /**
   * Extract props from extended interfaces, excluding React/HTML element types
   */
  private extractPropsFromExtends(propsInterface: InterfaceDeclaration, sourceFile: any, fileName: string): Record<string, PropMetadata> {
    const props: Record<string, PropMetadata> = {};

    // Get all extended types
    const extendsClauses = propsInterface.getExtends();

    for (const extendsClause of extendsClauses) {
      const extendedTypeName = extendsClause.getExpression().getText();

      // Skip React/HTML element prop types (ComponentPropsWithoutRef, HTMLAttributes, etc.)
      if (extendedTypeName.includes('React.') ||
          extendedTypeName.includes('ComponentProps') ||
          extendedTypeName.includes('HTMLAttributes') ||
          extendedTypeName.includes('HTMLProps') ||
          extendedTypeName.match(/^HTML\w+Element$/)) {
        continue;
      }

      // Extract the interface name (handle generic types like SomeInterface<T>)
      const interfaceNameMatch = extendedTypeName.match(/^(\w+)/);
      if (!interfaceNameMatch) continue;

      const interfaceName = interfaceNameMatch[1];

      // Try to find the interface in the same file
      const extendedInterface = sourceFile.getInterface(interfaceName);

      if (extendedInterface) {
        // Recursively extract props from the extended interface
        const extendedInterfaceProps = this.extractPropsFromInterface(extendedInterface, sourceFile, fileName);

        // Merge props (existing props take precedence)
        for (const [propName, propMetadata] of Object.entries(extendedInterfaceProps)) {
          if (!props[propName]) {
            props[propName] = propMetadata;
          }
        }

        // Also check if this extended interface extends other interfaces
        const nestedExtendedProps = this.extractPropsFromExtends(extendedInterface, sourceFile, fileName);
        for (const [propName, propMetadata] of Object.entries(nestedExtendedProps)) {
          if (!props[propName]) {
            props[propName] = propMetadata;
          }
        }
      }
    }

    return props;
  }

  /**
   * Extract props from a single interface (helper for extractPropsFromExtends)
   */
  private extractPropsFromInterface(propsInterface: InterfaceDeclaration, sourceFile: any, fileName: string): Record<string, PropMetadata> {
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

      // If JSDoc exists, parse its tags (even if description is empty)
      if (jsDocs && jsDocs.length > 0) {
        tags = this.parseJSDocTags(jsDocs);
      } else {
        // If no JSDoc, try to get leading comments
        const leadingComments = prop.getLeadingCommentRanges();
        if (leadingComments && leadingComments.length > 0) {
          const sourceFileText = prop.getSourceFile().getFullText();
          const commentText = leadingComments
            .map(range => sourceFileText.slice(range.getPos(), range.getEnd()))
            .join('\n')
            .replace(/\/\*\*?|\*\/|\*/g, '')
            .trim();

          // Parse tags from comments using @ syntax
          tags = this.parseTagsFromComments(commentText);

          // Use comment text as description if no tags were found
          if (Object.keys(tags).length === 0) {
            description = commentText;
          }
        }
      }

      // Check if it's a union type
      const values = this.extractUnionValues(prop.getTypeNode());

      // Try to find default value from component implementation
      const componentFunc = sourceFile.getFunctions().find((f: any) => f.getName() === fileName);
      const componentVar = sourceFile.getVariableDeclaration(fileName);
      const componentNode = componentFunc || componentVar;
      const defaultValue = this.findDefaultValue(componentNode, propName);

      props[propName] = {
        type: typeText,
        values,
        optional,
        default: defaultValue,
        description,
        renderVariants: tags.renderVariants === 'true',
        displayTemplate: tags.displayTemplate,
        hideInDocs: tags.hideInDocs === 'true',
        example: tags.example,
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
   * Looks for patterns like "@hideInDocs" or "renderVariants: true"
   */
  private parseTagsFromComments(commentText: string): Record<string, string> {
    const tags: Record<string, string> = {};
    const lines = commentText.split('\n');

    for (const line of lines) {
      // Match pattern: "@tagName value" (JSDoc style)
      const jsDocMatch = line.match(/@(\w+)(?:\s+(.+))?/);
      if (jsDocMatch) {
        const [, tagName, value] = jsDocMatch;
        tags[tagName.trim()] = value ? value.trim() : 'true';
        continue;
      }

      // Match pattern: "tagName: value" (alternative style)
      const colonMatch = line.match(/(\w+):\s*(.+)/);
      if (colonMatch) {
        const [, tagName, value] = colonMatch;
        tags[tagName.trim()] = value.trim();
      }
    }

    return tags;
  }

  /**
   * Extract component description from JSDoc
   */
  private extractDescription(node: any): string {
    if (!node) return '';

    // Try method 1: getJsDocs (works for functions and VariableStatements)
    if (typeof node.getJsDocs === 'function') {
      const jsDocs = node.getJsDocs();
      if (jsDocs && jsDocs.length > 0) {
        const description = jsDocs[0].getDescription();
        const desc = typeof description === 'string' ? description.trim() : '';
        if (desc) return desc;
      }
    }

    // Try method 2: Leading comment ranges (fallback for other node types)
    if (typeof node.getLeadingCommentRanges === 'function') {
      const sourceFile = node.getSourceFile();
      if (sourceFile) {
        const leadingComments = node.getLeadingCommentRanges();
        if (leadingComments && leadingComments.length > 0) {
          const sourceFileText = sourceFile.getFullText();

          // Get the last comment (usually the JSDoc right before the declaration)
          const lastComment = leadingComments[leadingComments.length - 1];
          const commentText = sourceFileText.slice(lastComment.getPos(), lastComment.getEnd());

          // Check if it's a JSDoc comment (starts with /**)
          if (commentText.trim().startsWith('/**')) {
            // Extract content between /** and */
            const cleaned = commentText
              .replace(/\/\*\*/, '')  // Remove /**
              .replace(/\*\//, '')     // Remove */
              .split('\n')
              .map((line: string) => line.replace(/^\s*\*\s?/, '')) // Remove leading * from each line
              .filter((line: string) => !line.trim().startsWith('@')) // Remove @tags
              .join(' ')
              .trim();

            if (cleaned) return cleaned;
          }
        }
      }
    }

    return '';
  }

  /**
   * Find default prop values in component implementation
   */
  private findDefaultValue(componentNode: any, propName: string): string | undefined {
    if (!componentNode) return undefined;

    // For variable declarations (const Component = ...), check the initializer
    let targetNode = componentNode;
    if (typeof componentNode.getInitializer === 'function') {
      targetNode = componentNode.getInitializer();
    }

    // Get parameters from the function/arrow function
    const params = targetNode.getParameters?.() || [];

    for (const param of params) {
      const binding = param.getNameNode();
      if (binding && binding.getKind() === SyntaxKind.ObjectBindingPattern) {
        for (const element of binding.getElements()) {
          if (element.getName() === propName) {
            const initializer = element.getInitializer();
            if (initializer) {
              const text = initializer.getText();
              // Remove quotes from string literals for cleaner display
              return text.replace(/^['"]|['"]$/g, '');
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
