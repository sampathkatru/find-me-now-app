"use server";

import { getReportingGuidance } from "@/ai/flows/community-reporting-guidance";
import { missingPersonSchema, type MissingPersonFormValues } from "@/lib/types";
import { z } from "zod";
import { db, storage } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Define the type for the form data coming from the client
type MissingPersonFormData = Omit<MissingPersonFormValues, 'dateLastSeen' | 'image'> & {
  dateLastSeen: string;
  image: {
    name: string;
    data: string; // base64 encoded string
  } | undefined;
};

export async function submitMissingPersonAction(formData: MissingPersonFormData) {
  const dataToValidate = {
    ...formData,
    dateLastSeen: new Date(formData.dateLastSeen), // Convert date string to Date object
    age: Number(formData.age), // Explicitly convert age to number
  };

  const validatedFields = missingPersonSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      message: "Validation failed. Please check the form fields.",
      isError: true,
    };
  }
  
  const { image, ...dataToSaveWithoutImage } = validatedFields.data;

  try {
    let imageUrl = "";
    if (image?.data && image.name) {
      const imageBuffer = Buffer.from(image.data, 'base64');
      const storageRef = ref(storage, `missing-persons/${Date.now()}-${image.name}`);
      const uploadResult = await uploadBytes(storageRef, imageBuffer, { contentType: 'image/jpeg' });
      imageUrl = await getDownloadURL(uploadResult.ref);
    }

    // Save report to Firestore
    await addDoc(collection(db, "missingPersons"), {
      ...dataToSaveWithoutImage,
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
  const dummyData: MissingPersonFormData = {
    name: "Jane Doe (Test)",
    age: 30,
    gender: "Female",
    lastSeenLocation: "Test Park, Main Street",
    dateLastSeen: new Date().toISOString(),
    contactInfo: "555-123-4567",
    description: "This is a test report submitted automatically to verify functionality. She was last seen wearing a blue jacket and jeans.",
    image: {
      name: "test-image.jpg",
      // A 1x1 red pixel in base64
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==",
    },
  };

  const result = await submitMissingPersonAction(dummyData);

  if (result.isError) {
    console.error("Dummy data submission failed:", result.message);
  } else {
    console.log("Dummy data submission successful!");
  }

  return result;
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
