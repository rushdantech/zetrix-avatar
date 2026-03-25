import { z } from "zod";
import { ENTERPRISE_CAPABILITIES } from "@/lib/studio/constants";

const agentTypes = [
  "Internal Operations",
  "Customer-Facing",
  "Compliance & Reporting",
  "Financial Processing",
  "Custom",
] as const;
const operatingHours = ["24/7", "Business hours only", "Custom schedule"] as const;

export const enterpriseStep1Schema = z.object({
  name: z.string().min(1, "Agent name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  agentType: z.enum(agentTypes),
  department: z.string().optional(),
});

const customApiMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

const capabilityMetaByKey = Object.fromEntries(ENTERPRISE_CAPABILITIES.map((c) => [c.key, c])) as Record<
  string,
  (typeof ENTERPRISE_CAPABILITIES)[number]
>;

export const enterpriseStep2Schema = z
  .object({
    capabilities: z.array(z.string()),
    capabilityApiKeys: z.record(z.string(), z.string()),
    capabilityApiAccessRequested: z.record(z.string(), z.boolean()),
    customApiIntegration: z.object({
      endpointUrl: z.string(),
      httpMethod: z.enum(customApiMethods),
      integrationCode: z.string(),
    }),
    operatingHours: z.enum(operatingHours),
    maxConcurrentTasks: z.coerce.number().min(1).max(100),
    escalationEmail: z.union([z.literal(""), z.string().email("Enter a valid email")]),
  })
  .superRefine((data, ctx) => {
    for (const key of data.capabilities) {
      const meta = capabilityMetaByKey[key];
      if (!meta || meta.authMode !== "provider") continue;
      const hasKey = (data.capabilityApiKeys[key] ?? "").trim().length > 0;
      const requested = data.capabilityApiAccessRequested[key] === true;
      if (!hasKey && !requested) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Paste an API key or request access for “${meta.label}”.`,
          path: ["capabilityApiKeys", key],
        });
      }
    }
    if (data.capabilities.includes("custom-api")) {
      const url = data.customApiIntegration.endpointUrl.trim();
      const code = data.customApiIntegration.integrationCode.trim();
      if (!url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the base URL your agent will call.",
          path: ["customApiIntegration", "endpointUrl"],
        });
      } else {
        let ok = false;
        try {
          const u = new URL(url);
          ok = u.protocol === "http:" || u.protocol === "https:";
        } catch {
          ok = false;
        }
        if (!ok) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Use a full URL, e.g. https://api.example.com",
            path: ["customApiIntegration", "endpointUrl"],
          });
        }
      }
      if (code.length < 40) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Add or extend the integration code (at least a short handler).",
          path: ["customApiIntegration", "integrationCode"],
        });
      }
    }
  });

export const enterpriseStep3Schema = z
  .object({
    setupIdentityNow: z.boolean(),
    selectedScopes: z.array(z.string()),
    validityStart: z.string().optional(),
    validityEnd: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.setupIdentityNow && data.selectedScopes.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one scope when setting up identity now",
        path: ["selectedScopes"],
      });
    }
    if (data.setupIdentityNow) {
      if (!data.validityStart || !data.validityEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Set validity start and end dates",
          path: ["validityStart"],
        });
      }
    }
    if (data.setupIdentityNow && data.validityStart && data.validityEnd) {
      const a = new Date(data.validityStart).getTime();
      const b = new Date(data.validityEnd).getTime();
      if (a >= b) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date must be after start date",
          path: ["validityEnd"],
        });
      }
    }
  });

export type EnterpriseStep1Input = z.infer<typeof enterpriseStep1Schema>;
