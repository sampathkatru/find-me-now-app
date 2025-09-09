'use server';
/**
 * @fileOverview Provides AI-powered guidance on writing effective descriptions of missing persons.
 *
 * - getReportingGuidance - A function that generates advice on writing clear descriptions of missing persons.
 * - ReportingGuidanceInput - The input type for the getReportingGuidance function.
 * - ReportingGuidanceOutput - The return type for the getReportingGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportingGuidanceInputSchema = z.object({
  missingPersonDetails: z
    .string()
    .describe('Details of the missing person, including name, age, gender, last known location, and date last seen.'),
});
export type ReportingGuidanceInput = z.infer<typeof ReportingGuidanceInputSchema>;

const ReportingGuidanceOutputSchema = z.object({
  guidance: z
    .string()
    .describe('AI-powered advice on writing an effective description of the missing person.'),
});
export type ReportingGuidanceOutput = z.infer<typeof ReportingGuidanceOutputSchema>;

export async function getReportingGuidance(input: ReportingGuidanceInput): Promise<ReportingGuidanceOutput> {
  return reportingGuidanceFlow(input);
}

const reportingGuidancePrompt = ai.definePrompt({
  name: 'reportingGuidancePrompt',
  input: {schema: ReportingGuidanceInputSchema},
  output: {schema: ReportingGuidanceOutputSchema},
  prompt: `You are an AI assistant that provides guidance on writing effective descriptions of missing persons for community reports.

  Based on the following details of the missing person:
  {{missingPersonDetails}}

  Provide advice on how to write a clear, concise, and helpful description to aid volunteers in the search. Focus on including specific details that can help identify the person and their last known whereabouts.`,
});

const reportingGuidanceFlow = ai.defineFlow(
  {
    name: 'reportingGuidanceFlow',
    inputSchema: ReportingGuidanceInputSchema,
    outputSchema: ReportingGuidanceOutputSchema,
  },
  async input => {
    const {output} = await reportingGuidancePrompt(input);
    return output!;
  }
);
