"use server";

import { getReportingGuidance } from "@/ai/flows/community-reporting-guidance";
import { missingPersonSchema } from "@/lib/types";
import { z } from "zod";

export async function submitMissingPerson(prevState: any, formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  
  const image = formData.get("image") as File;
  if (!image || image.size === 0) {
    return {
      message: "Image is required.",
      isError: true,
    };
  }

  // Manually parse date since it comes as a string from FormData
  const validatedFields = missingPersonSchema.safeParse({
    name: values.name,
    age: values.age,
    gender: values.gender,
    lastSeenLocation: values.lastSeenLocation,
    dateLastSeen: new Date(values.dateLastSeen as string),
    contactInfo: values.contactInfo,
    description: values.description,
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check the fields.",
      isError: true,
    };
  }

  // Here you would upload the image to Firebase Storage
  // and then save the data along with the image URL to Firestore.
  console.log("Submitting to Firebase...");
  console.log("Validated Data:", validatedFields.data);
  console.log("Image:", image.name, image.type, image.size);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  console.log("Submission successful.");

  return {
    message: "Report submitted successfully!",
    isError: false,
  };
}

const aiGuidanceSchema = z.object({
  details: z.string(),
});

export async function generateGuidanceAction(data: { details: string }) {
  const validated = aiGuidanceSchema.safeParse(data);
  if (!validated.success) {
    return { error: "Invalid input for guidance generation." };
  }

  try {
    const result = await getReportingGuidance({
      missingPersonDetails: validated.data.details,
    });
    return { guidance: result.guidance };
  } catch (e) {
    console.error(e);
    return { error: "Failed to generate guidance. Please try again." };
  }
}
