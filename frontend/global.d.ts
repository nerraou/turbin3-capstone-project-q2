declare namespace NodeJS {
  interface ProcessEnv {
    // Database
    DATABASE_HOST: string;
    DATABASE_PORT: string;
    DATABASE_USER: string;
    DATABASE_PASSWORD: string;
    DATABASE_NAME: string;

    // JWT
    JWT_SECRET: string;

    // Wallet encryption
    WALLET_KEK: string;
  }
}
