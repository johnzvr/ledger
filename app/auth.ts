import { env } from "cloudflare:workers";
import { headers } from "next/headers";

export type FitZUser = {
  userId: string;
  email: string;
};

const ACCESS_EMAIL_HEADER = "cf-access-authenticated-user-email";

export async function getFitZUser(): Promise<FitZUser | null> {
  const requestHeaders = await headers();
  const email = requestHeaders.get(ACCESS_EMAIL_HEADER)?.trim().toLowerCase();
  if (!email) return null;

  const ownerEmail = env.FITZ_OWNER_EMAIL?.trim().toLowerCase();
  if (!ownerEmail || email !== ownerEmail) return null;

  return { userId: email, email };
}
