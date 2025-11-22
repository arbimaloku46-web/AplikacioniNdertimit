declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    NODE_ENV: string;
    PUBLIC_URL: string;
    [key: string]: string | undefined;
  }
}
