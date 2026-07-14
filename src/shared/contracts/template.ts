import { z } from 'zod'

export const TemplateSectionKindSchema = z.enum(['paragraph', 'bullet_list', 'action_items'])
export type TemplateSectionKind = z.infer<typeof TemplateSectionKindSchema>

export const SummaryTemplateSectionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  kind: TemplateSectionKindSchema,
  prompt: z.string().trim().min(1).max(2_000),
}).strict()
export type SummaryTemplateSection = z.infer<typeof SummaryTemplateSectionSchema>

export const SummaryTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(200),
  isDefault: z.boolean(),
  sections: z.array(SummaryTemplateSectionSchema).min(1).max(8),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
}).strict()
export type SummaryTemplate = z.infer<typeof SummaryTemplateSchema>

export const CreateTemplateInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  sections: z.array(SummaryTemplateSectionSchema.omit({ id: true })).min(1).max(8),
}).strict()
export type CreateTemplateInput = z.input<typeof CreateTemplateInputSchema>

export const UpdateTemplateInputSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  sections: z.array(SummaryTemplateSectionSchema).min(1).max(8).optional(),
}).strict().refine((value) => value.name !== undefined || value.sections !== undefined, 'No changes supplied')
export type UpdateTemplateInput = z.input<typeof UpdateTemplateInputSchema>

export interface TemplatesApi {
  list(): Promise<SummaryTemplate[]>
  create(input: CreateTemplateInput): Promise<SummaryTemplate>
  update(id: string, input: UpdateTemplateInput): Promise<SummaryTemplate>
  reorderSections(id: string, orderedSectionIds: string[]): Promise<SummaryTemplate>
  delete(id: string): Promise<void>
}
