import { z } from 'zod';

export type JobStatus = 'Applied' | 'Interviewing' | 'Offered' | 'Rejected' | 'Reply Received';
export type WorkType = 'Remote' | 'Hybrid' | 'Onsite';
export type FollowUpStatus = 'pending' | 'sent' | 'cancelled' | 'reply_received';
export type FollowUpTiming = 'days' | 'weeks' | 'months';

export const followUpSchema = z.object({
  id: z.string().optional(),
  jobId: z.string(),
  scheduledDate: z.date(),
  emailSubject: z.string().min(1, 'Subject is required'),
  emailBody: z.string().min(1, 'Email body is required'),
  status: z.enum(['pending', 'sent', 'cancelled', 'reply_received']),
  timing: z.enum(['immediate', 'tomorrow', 'custom']),
});

export const jobSchema = z.object({
  id: z.string().optional(),
  position: z.string(),
  company: z.string(),
  location: z.string(),
  salary: z.string().optional(),
  status: z.string(),
  appliedDate: z.string(),
  description: z.string().optional(),
  recruiterEmail: z.string().optional(),
  userId: z.string(),
});

export type Job = z.infer<typeof jobSchema>;
export type FollowUp = z.infer<typeof followUpSchema>;

export const emailDraftSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
});

export type EmailDraft = z.infer<typeof emailDraftSchema>;