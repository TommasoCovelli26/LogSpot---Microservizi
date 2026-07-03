/**
 * Indirizzi dei microservizi.
 * In locale vengono utilizzate le porte indicate.
 * In produzione verranno lette dalle variabili d'ambiente.
 */

export const SERVICES = {
  USER: process.env.USER_SERVICE_URL || "http://localhost:8081",
  CATALOG: process.env.CATALOG_SERVICE_URL || "http://localhost:8082",
  THERAPY: process.env.THERAPY_SERVICE_URL || "http://localhost:8083",
};