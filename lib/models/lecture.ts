import { z } from 'zod';

export const lectureMetadataSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  classId: z.string().min(1),
  teacherId: z.string().min(1),
  videoFolderName: z.string().regex(/^\d+-\d+$/),
});

export type LectureMetadata = z.infer<typeof lectureMetadataSchema>;
