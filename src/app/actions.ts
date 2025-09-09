"use server";

import { getReportingGuidance } from "@/ai/flows/community-reporting-guidance";
import { missingPersonSchema } from "@/lib/types";
import { z } from "zod";
import { db, storage } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function submitMissingPerson(prevState: any, formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  
  const image = formData.get("image") as File;
  if (!image || image.size === 0) {
    return {
      message: "Image is required.",
      isError: true,
    };
  }

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
    console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      message: "Validation failed. Please check the form fields.",
      isError: true,
    };
  }

  try {
    // Upload image to Firebase Storage
    const storageRef = ref(storage, `missing-persons/${Date.now()}-${image.name}`);
    const uploadResult = await uploadBytes(storageRef, image);
    const imageUrl = await getDownloadURL(uploadResult.ref);

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
