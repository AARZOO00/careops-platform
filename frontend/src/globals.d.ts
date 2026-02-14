// Type declarations for CSS modules
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Specific declaration for globals.css import in layout.tsx
declare module './globals.css' {
  const content: any;
  export default content;
}

// Declaration for environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_APP_URL: string;
  }
}

// Declaration for image imports
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}