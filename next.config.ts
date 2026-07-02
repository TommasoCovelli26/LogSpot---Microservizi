import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Questa è la riga magica che risolve il problema di sqlite
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;