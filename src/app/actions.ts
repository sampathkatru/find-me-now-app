"use server";

import { getReportingGuidance } from "@/ai/flows/community-reporting-guidance";
import { missingPersonSchema, type MissingPersonFormValues } from "@/lib/types";
import { z } from "zod";
import { db, storage } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function submitMissingPersonAction(values: MissingPersonFormValues, image: {data: string, name: string}) {
  const validatedFields = missingPersonSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      message: "Validation failed. Please check the form fields.",
      isError: true,
    };
  }

  try {
    // const imageBuffer = Buffer.from(image.data, 'base64');
    
    // // Upload image to Firebase Storage
    // const storageRef = ref(storage, `missing-persons/${Date.now()}-${image.name}`);
    // const uploadResult = await uploadBytes(storageRef, imageBuffer);
    // const imageUrl = await getDownloadURL(uploadResult.ref);

    const imageUrl = "https://picsum.photos/200/300"; // Test image url

    // Save report to Firestore
    await addDoc(collection(db, "missingPersons"), {
      ...validatedFields.data,
      imageUrl,
      createdAt: new Date(),
    });

    console.log("Submission successful.");

    return {
      message: "Report submitted successfully!",
      isError: false,
    };
  } catch (error) {
    console.error("Error submitting report: ", error);
    return {
      message: "An error occurred while submitting the report.",
      isError: true,
    };
  }
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
