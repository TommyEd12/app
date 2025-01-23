// src/robokassa.d.ts
declare module "node-robokassa" {
  class RobokassaHelper {
    constructor(options: {
      merchantLogin: string;
      hashingAlgorithm: string;
      password1: string;
      password2: string;
      testMode?: boolean;
      resultUrlRequestMethod?: "GET" | "POST";
    });

    generatePaymentUrl(outSum: number, invDesc: string, options: any): string;
    handleResultUrlRequest(
      request: any,
      response: {
        setHeader: (header: string, value: string) => void;
        end: () => void;
      },
      callback: (values: any, userData: any) => void
    ): Promise<void>;
  }

  const robokassa: { RobokassaHelper: typeof RobokassaHelper };

  export = robokassa;
}
