import { env } from "node:process";

export function getJwtSecret() {
  const secret = env.JWT_SECRET;
  if (!secret?.trim() || secret.trim() === "dev-secret-change-this") {
    throw new Error("JWT_SECRET must be configured with a private, randomly generated secret.");
  }
  return secret;
}
