# Claude Project Configuration

This directory contains configuration and knowledge base for Claude AI assistance with the Documentor project.

## Structure

- `project.json` - Main project configuration
- `knowledge/` - Project-specific documentation and context
- `prompts/` - Reusable prompt templates

## Usage

Claude will automatically use these files to understand your project context and provide better assistance.

### Knowledge Base
The `knowledge/` directory contains project documentation that Claude can reference:
- `project-overview.md` - High-level project information

### Custom Prompts
The `prompts/` directory contains reusable prompts:
- `code-review.md` - Template for code reviews

## Updating Context

Add new markdown files to `knowledge/` to expand Claude's understanding of your project:
- Architecture decisions
- API documentation
- Component guidelines
- Testing strategies
