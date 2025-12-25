// Manually define Vite types to avoid missing type definition error

interface ImportMetaEnv {
  [key: string]: any;
  BASE_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  url: string;
  readonly env: ImportMetaEnv;
  glob: any;
}

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    NODE_ENV: string;
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    [key: string]: string | undefined;
  }
}