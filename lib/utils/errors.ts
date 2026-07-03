/**
 * Errore restituito da un microservizio.
 */
export class GatewayError extends Error {

  constructor(
    message: string,
    public status: number
  ) {

    super(message);

    this.name = "GatewayError";

  }

}