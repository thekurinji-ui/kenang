declare module "midtrans-client" {
  interface MidtransClientConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionStatusResponse {
    transaction_status: string;
    fraud_status?: string;
    payment_type?: string;
    transaction_id?: string;
    [key: string]: unknown;
  }

  export class Snap {
    constructor(config: MidtransClientConfig);
    createTransaction(parameter: Record<string, unknown>): Promise<{
      token: string;
      redirect_url: string;
      [key: string]: unknown;
    }>;
  }

  export class CoreApi {
    constructor(config: MidtransClientConfig);
    transaction: {
      status(orderId: string): Promise<TransactionStatusResponse>;
      notification(payload: Record<string, unknown>): Promise<TransactionStatusResponse>;
    };
  }

  const midtransClient: { Snap: typeof Snap; CoreApi: typeof CoreApi };
  export default midtransClient;
}
