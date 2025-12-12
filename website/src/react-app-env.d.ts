/// <reference types="react-scripts" />

// Type declarations for CSS/SCSS modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const content: { readonly [key: string]: string };
  export default content;
}

declare module '*.sass' {
  const content: { readonly [key: string]: string };
  export default content;
}

declare module '*.css' {
  const content: { readonly [key: string]: string };
  export default content;
}
