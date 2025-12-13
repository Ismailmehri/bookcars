declare module 'node-mailjet' {
  export interface MailjetRequest {
    request: (payload: unknown) => Promise<unknown>
  }

  export interface MailjetClient {
    post: (resource: string, options?: Record<string, unknown>) => MailjetRequest
  }

  export interface MailjetModule {
    apiConnect: (publicKey: string, privateKey: string) => MailjetClient
  }

  const mailjet: MailjetModule
  export = mailjet
}
