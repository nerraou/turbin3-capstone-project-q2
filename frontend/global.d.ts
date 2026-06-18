declare namespace NodeJS {
  interface ProcessEnv {
    // App
    NEXT_PUBLIC_HOST_URL: string;

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

    // Solana
    SOLANA_RPC_URL: string;
    TRAVELRAMP_PROGRAM_ID: string;
    BACKEND_WALLET_SECRET_KEY: string;

    // App Admin User
    APP_ADMIN_USERNAME: string;
    APP_ADMIN_PASSWORD: string;

    // Payment Gateway
    NEXT_PUBLIC_URL: string;
  }
}
