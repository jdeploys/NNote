import { useEffect, useState } from 'react'
import type { SummaryTemplate, TemplatesApi } from '../../../../shared/contracts/template'

interface TemplateEditorProps {
  templates: TemplatesApi
}

export function TemplateEditor({ templates: api }: TemplateEditorProps) {
  const [items, setItems] = useState<SummaryTemplate[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const selected = items.find(({ id }) => id === selectedId) ?? items[0]

  useEffect(() => {
    let active = true
    api.list().then((loaded) => {
      if (!active) return
      setItems(loaded)
      setSelectedId((current) => current ?? loaded[0]?.id ?? null)
    }).catch(() => active && setError('템플릿을 불러오지 못했습니다.'))
    return () => { active = false }
  }, [api])

  useEffect(() => setName(selected?.name ?? ''), [selected?.id, selected?.name])

  async function saveName() {
    if (!selected || selected.isDefault) return
    try {
      const updated = await api.update(selected.id, { name })
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item))
      setError(null)
    } catch {
      setError('템플릿 이름을 저장하지 못했습니다.')
    }
  }

  async function moveSection(index: number, direction: -1 | 1) {
    if (!selected || selected.isDefault) return
    const target = index + direction
    if (target < 0 || target >= selected.sections.length) return
    const ids = selected.sections.map(({ id }) => id)
    ;[ids[index], ids[target]] = [ids[target]!, ids[index]!]
    try {
      const updated = await api.reorderSections(selected.id, ids)
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch {
      setError('섹션 순서를 저장하지 못했습니다.')
    }
  }

  async function createTemplate() {
    try {
      const created = await api.create({
        name: '새 템플릿',
        sections: [{ title: '요약', kind: 'paragraph', prompt: '회의 내용을 요약하세요.' }],
      })
      setItems((current) => [...current, created])
      setSelectedId(created.id)
    } catch {
      setError('템플릿을 만들지 못했습니다.')
    }
  }

  async function deleteTemplate() {
    if (!selected || selected.isDefault) return
    try {
      await api.delete(selected.id)
      const remaining = items.filter(({ id }) => id !== selected.id)
      setItems(remaining)
      setSelectedId(remaining[0]?.id ?? null)
    } catch {
      setError('템플릿을 삭제하지 못했습니다.')
    }
  }

  return <section aria-label="요약 템플릿">
    <nav aria-label="템플릿 목록">
      {items.map((template) => <button key={template.id} type="button" onClick={() => setSelectedId(template.id)}>{template.name}</button>)}
      <button type="button" onClick={createTemplate}>새 템플릿</button>
    </nav>
    {error && <p role="alert">{error}</p>}
    {selected?.isDefault ? <p>기본 템플릿은 수정하거나 삭제할 수 없습니다.</p> : selected ? <div>
      <label>템플릿 이름 <input aria-label="템플릿 이름" value={name} onChange={(event) => setName(event.target.value)} /></label>
      <button type="button" onClick={saveName}>이름 저장</button>
      <ol>{selected.sections.map((section, index) => <li key={section.id}>
        <span>{section.title}</span>
        <button type="button" aria-label="위로 이동" disabled={index === 0} onClick={() => moveSection(index, -1)}>↑</button>
        <button type="button" aria-label="아래로 이동" disabled={index === selected.sections.length - 1} onClick={() => moveSection(index, 1)}>↓</button>
      </li>)}</ol>
      <button type="button" onClick={deleteTemplate}>삭제</button>
    </div> : null}
  </section>
}
