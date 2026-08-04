import { apiRequest } from "../lib/api";
import { unwrapData } from "../lib/api/unwrap";

export type MarketingEmailPrefs = {
  enabled: boolean;
  unsubscribedAt: string | null;
  hasUnsubscribeToken?: boolean;
};

export async function fetchMyMarketingEmail(): Promise<MarketingEmailPrefs> {
  const res = await apiRequest("/me/marketing-email");
  const data = unwrapData(res) as Partial<MarketingEmailPrefs>;
  return {
    enabled: data.enabled !== false,
    unsubscribedAt: data.unsubscribedAt ?? null,
    hasUnsubscribeToken: Boolean(data.hasUnsubscribeToken),
  };
}

export async function patchMyMarketingEmail(enabled: boolean) {
  return apiRequest("/me/marketing-email", {
    method: "PATCH",
    body: { enabled },
  });
}

/** Public — no auth. */
export async function getUnsubscribeStatus(token: string) {
  const q = new URLSearchParams({ token });
  return apiRequest(`/email/unsubscribe?${q.toString()}`, { auth: false });
}

/** Public — no auth. */
export async function confirmUnsubscribe(token: string) {
  return apiRequest("/email/unsubscribe", {
    method: "POST",
    auth: false,
    body: { token },
  });
}
