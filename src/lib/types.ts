import { z } from "zod";

const imageSchema = z.object({
  name: z.string(),
  data: z.string(),
});

export const missingPersonSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  age: z.coerce.number().min(0, "Age must be a positive number.").max(150),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Gender is required." }),
  lastSeenLocation: z.string().min(5, "Please provide a more detailed location."),
  dateLastSeen: z.date({
    required_error: "A date is required.",
  }),
  contactInfo: z.string().min(5, "Contact information is required."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  image: imageSchema.optional(),
});

export type MissingPersonFormValues = z.infer<typeof missingPersonSchema>;
