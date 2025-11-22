declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    PUBLIC_URL: string;
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
