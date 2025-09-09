
"use server";

import { getReportingGuidance } from "@/ai/flows/community-reporting-guidance";
import { missingPersonSchema } from "@/lib/types";
import { z } from "zod";
import { db, storage } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function submitMissingPersonAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  const validatedFields = missingPersonSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      message: "Validation failed. Please check the form fields.",
      isError: true,
    };
  }
  
  const { image, ...reportData } = validatedFields.data;

  try {
    let imageUrl = "";
    if (image instanceof File && image.size > 0) {
      const imageBuffer = Buffer.from(await image.arrayBuffer());
      const storageRef = ref(storage, `missing-persons/${Date.now()}-${image.name}`);
      const uploadResult = await uploadBytes(storageRef, imageBuffer, { contentType: image.type });
      imageUrl = await getDownloadURL(uploadResult.ref);
    }

    const dataToSave = {
      ...reportData,
      age: Number(reportData.age),
      dateLastSeen: new Date(reportData.dateLastSeen),
      imageUrl: imageUrl,
      createdAt: new Date(),
    };

    await addDoc(collection(db, "missingPersons"), dataToSave);

    return {
      message: "Report submitted successfully!",
      isError: false,
    };
  } catch (error) {
    console.error("Error submitting report: ", error);
    if (error instanceof Error) {
      return {
        message: `An error occurred while submitting the report: ${error.message}`,
        isError: true,
      };
    }
    return {
      message: "An error occurred while submitting the report.",
      isError: true,
    };
  }
}

export async function testSubmitDummyDataAction() {
  console.log("Attempting to submit dummy data...");
  const dummyData = {
    name: "Jane Doe (Test)",
    age: 30,
    gender: "Female",
    lastSeenLocation: "Test Park, Main Street",
    dateLastSeen: new Date(),
    contactInfo: "555-123-4567",
    description: "This is a test report submitted automatically to verify functionality. She was last seen wearing a blue jacket and jeans.",
    imageUrl: '', // No image for this test
    createdAt: new Date(),
  };

  try {
    await addDoc(collection(db, "missingPersons"), dummyData);
     return {
      message: "Report submitted successfully!",
      isError: false,
    };
  } catch (error) {
     console.error("Dummy data submission failed:", error);
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
