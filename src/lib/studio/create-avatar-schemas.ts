import { z } from "zod";

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

export const enterpriseStep2Schema = z.object({
  capabilities: z.array(z.string()).min(1, "Select at least one capability"),
  operatingHours: z.enum(operatingHours),
  maxConcurrentTasks: z.coerce.number().min(1).max(100),
  escalationEmail: z.union([z.literal(""), z.string().email("Enter a valid email")]),
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
