/**
 * Mock WhatsApp numbers for specific marketplace browse / chat listings (wa.me links).
 */
export const MARKETPLACE_AVATAR_WHATSAPP_MOCKS: Record<string, string> = {
  "pop-chloe-2025": "+60 12-345 6789",
  "pop-lizzie-2025": "+852 9123 4567",
  "zetrix-ai-avatar-myeg": "+60 19-888 7766",
};

export function marketplaceWhatsAppRawForListingId(id: string): string | undefined {
  return MARKETPLACE_AVATAR_WHATSAPP_MOCKS[id];
}
