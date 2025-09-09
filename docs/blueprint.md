# **App Name**: FindMeNow

## Core Features:

- Missing Person Details Form: Form in React web app for admins to enter details (Name, Age, Gender, Last Seen, Contact) of a missing person.
- Image Upload: Allow uploading an image of the missing person via the React web app; store in Firebase Storage.
- Data Storage: Store missing person details and image URL in Firebase Firestore from React web app submission.
- Data Sync: Ensure near real-time data synchronization between React web app and Flutter app via Firebase.
- Community Search: Enable community members to search and filter missing persons data (name, location, date) from the Flutter app.
- Community Reporting Guidance: Provide AI powered advice on best practices for writing descriptions of missing persons, to ensure clarity for volunteers (AI acts as a tool).
- User Role Management: Restrict user roles. Only allow admins to upload content from the React app; volunteers can view on the Flutter app.

## Style Guidelines:

- Primary color: Sky Blue (#87CEEB) evoking a sense of calmness and hope.
- Background color: Light gray (#F0F0F0) for a clean and unobtrusive backdrop.
- Accent color: Warm Orange (#FFA500) to highlight calls to action and important information.
- Body and headline font: 'PT Sans' (sans-serif) provides a modern yet accessible feel for all users.
- Use clear and recognizable icons from a set like Material Design Icons for UI elements.
- Maintain a simple and intuitive layout. The React web app will use a clear form layout, and the Flutter app will present information clearly.
- Subtle transitions and animations to indicate loading or changes in the UI.