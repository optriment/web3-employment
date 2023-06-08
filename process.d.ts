declare namespace NodeJS {
  export interface ProcessEnv {
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string

    EMAIL_SERVER_USER: string
    EMAIL_SERVER_PASSWORD: string
    EMAIL_SERVER_HOST: string
    EMAIL_SERVER_PORT: number
    EMAIL_FROM: string

    GITHUB_CLIENT_ID: string
    GITHUB_CLIENT_SECRET: string

    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string

    LINKEDIN_CLIENT_ID: string
    LINKEDIN_CLIENT_SECRET: string
  }
}
