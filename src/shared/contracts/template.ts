import { z } from 'zod'

export const SummaryTemplateSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  kind: z.enum(['summary', 'decisions', 'action-items', 'discussion', 'custom']),
  prompt: z.string().min(1),
})
export type SummaryTemplateSection = z.infer<typeof SummaryTemplateSectionSchema>

export const SummaryTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sections: z.array(SummaryTemplateSectionSchema),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
})
export type SummaryTemplate = z.infer<typeof SummaryTemplateSchema>
