/**
 * Indirizzi dei microservizi passati attraverso l'API Gateway.
 * Il Gateway è in ascolto sulla porta 8080.
 */
export const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:8080";

export const SERVICES = {
  // Il Gateway intercetta /api/auth e lo riscrive in /auth verso user-service
  AUTH: `${GATEWAY_URL}/api/auth`,       
  
  // Il Gateway intercetta /api/utenti e lo riscrive in /users verso user-service
  USER: `${GATEWAY_URL}/api/utenti`,     
  
  // Il Gateway intercetta /api/catalogo e lo riscrive in /catalog verso catalog-service
  CATALOG: `${GATEWAY_URL}/api/catalogo`,
  
  // Il Gateway intercetta e invia direttamente a /api/terapia verso therapy-service
  THERAPY: `${GATEWAY_URL}/api/terapia`, 
};