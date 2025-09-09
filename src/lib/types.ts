
import { z } from "zod";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


export const missingPersonSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  age: z.coerce.number().min(0, "Age must be a positive number.").max(150),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Gender is required." }),
  lastSeenLocation: z.string().min(5, "Please provide a more detailed location."),
  dateLastSeen: z.string({
    required_error: "A date is required.",
  }),
  contactInfo: z.string().min(5, "Contact information is required."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  image: z
    .any()
    .refine((file) => !file || file?.size <= MAX_FILE_SIZE, `Max image size is 4MB.`)
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ).optional(),
});

export type MissingPersonFormValues = z.infer<typeof missingPersonSchema>;
