'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Idea, ContextAreaSummary, ContextAreaContent, ContextAreaSection, ContextAreaGap } from '@horizon/shared'

export function useIdeas() {
  return useQuery({
    queryKey: ['ideas'],
    queryFn: () => apiClient.get<Idea[]>('/api/v1/ideas'),
  })
}

export function useIdea(id: string) {
  return useQuery({
    queryKey: ['ideas', id],
    queryFn: () => apiClient.get<Idea>(`/api/v1/ideas/${id}`),
    enabled: !!id,
  })
}

export function useContextAreaSummaries(ideaId: string) {
  return useQuery({
    queryKey: ['ideas', ideaId, 'context'],
    queryFn: () => apiClient.get<ContextAreaSummary[]>(`/api/v1/ideas/${ideaId}/context`),
    enabled: !!ideaId,
  })
}

export function useContextArea(ideaId: string, areaKey: string) {
  return useQuery({
    queryKey: ['ideas', ideaId, 'context', areaKey],
    queryFn: () => apiClient.get<ContextAreaContent>(`/api/v1/ideas/${ideaId}/context/${areaKey}`),
    enabled: !!ideaId && !!areaKey,
  })
}

export function useCreateIdea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; description?: string; origin?: string }) =>
      apiClient.post<Idea>('/api/v1/ideas', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ideas'] }),
  })
}

export function useSaveContextArea(ideaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ areaKey, rawContent }: { areaKey: string; rawContent: string }) =>
      apiClient.patch(`/api/v1/ideas/${ideaId}/context/${areaKey}`, { rawContent }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['ideas', ideaId, 'context'] })
      qc.invalidateQueries({ queryKey: ['ideas', ideaId, 'context', variables.areaKey] })
      qc.invalidateQueries({ queryKey: ['ideas', ideaId] })
      qc.invalidateQueries({ queryKey: ['ideas'] })
    },
  })
}

export function useStructureArea(ideaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (areaKey: string) =>
      apiClient.post<{ sections: ContextAreaSection[]; structuredAt: string }>(
        `/api/v1/ideas/${ideaId}/context/${areaKey}/structure`,
        {}
      ),
    onSuccess: (_, areaKey) => {
      qc.invalidateQueries({ queryKey: ['ideas', ideaId, 'context', areaKey] })
      qc.invalidateQueries({ queryKey: ['ideas', ideaId, 'context'] })
    },
  })
}

export function useReviewSection(ideaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      areaKey,
      sectionId,
      status,
      content,
    }: {
      areaKey: string
      sectionId: string
      status: 'accepted' | 'rejected' | 'pending'
      content?: string
    }) =>
      apiClient.patch<ContextAreaSection>(
        `/api/v1/ideas/${ideaId}/context/${areaKey}/sections/${sectionId}`,
        { status, content }
      ),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['ideas', ideaId, 'context', variables.areaKey] })
    },
  })
}

export function useStructureAll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ideaId, rawContent }: { ideaId: string; rawContent: string }) =>
      apiClient.post<{ results: { areaKey: string; status: string; sectionCount: number }[] }>(
        `/api/v1/ideas/${ideaId}/structure-all`,
        { rawContent }
      ),
    onSuccess: (_, { ideaId }) => {
      qc.invalidateQueries({ queryKey: ['ideas', ideaId, 'context'] })
    },
  })
}

export function useIdentifyGaps(ideaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (areaKey: string) =>
      apiClient.post<{ gaps: ContextAreaGap[] }>(`/api/v1/ideas/${ideaId}/context/${areaKey}/identify-gaps`, {}),
    onSuccess: (_, areaKey) => {
      qc.invalidateQueries({ queryKey: ['ideas', ideaId, 'context', areaKey] })
    },
  })
}

export function useContextAreaFull(ideaId: string) {
  return useQuery({
    queryKey: ['ideas', ideaId, 'context', 'full'],
    queryFn: () => apiClient.get<ContextAreaContent[]>(`/api/v1/ideas/${ideaId}/context/full`),
    enabled: !!ideaId,
  })
}

export function useAnalyseIdea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<{ analysis: string; analysedAt: string }>(`/api/v1/ideas/${id}/analyse`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['ideas', id] })
    },
  })
}
