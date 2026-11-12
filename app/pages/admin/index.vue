<script lang="ts" setup>
  usePageSeo('admin')
  interface SourceStatus {
    key: string
    label: string
    tab: string
    file: string
    exists: boolean
    updatedAt: string | null
    sizeBytes: number
  }

  interface RefreshResult {
    key: string
    ok: boolean
    rows?: number
    updatedAt?: string
    error?: string
  }

  const { data: status, refresh: reloadStatus } = await useFetch<SourceStatus[]>('/api/admin/status')

  const refreshingKey = ref<string | null>(null)
  const refreshingAll = ref(false)
  const errors = ref<Record<string, string>>({})

  async function refreshOne(key: string) {
    refreshingKey.value = key
    errors.value = { ...errors.value, [key]: '' }
    try {
      const { results } = await $fetch<{ results: RefreshResult[] }>('/api/admin/refresh', {
        method: 'POST',
        body: { key }
      })
      const result = results[0]
      if (result && !result.ok) errors.value = { ...errors.value, [key]: result.error ?? 'Error desconocido' }
    } catch (e) {
      errors.value = { ...errors.value, [key]: e instanceof Error ? e.message : 'Error desconocido' }
    } finally {
      refreshingKey.value = null
      await reloadStatus()
    }
  }

  async function refreshAll() {
    refreshingAll.value = true
    errors.value = {}
    try {
      const { results } = await $fetch<{ results: RefreshResult[] }>('/api/admin/refresh', {
        method: 'POST',
        body: { key: 'all' }
      })
      for (const result of results) {
        if (!result.ok) errors.value = { ...errors.value, [result.key]: result.error ?? 'Error desconocido' }
      }
    } finally {
      refreshingAll.value = false
      await reloadStatus()
    }
  }

  function formatUpdatedAt(iso: string | null): string {
    if (!iso) return 'nunca actualizado'
    return new Date(iso).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
  }
</script>

<template>
  <div class="min-h-screen bg-white pt-12">
    <section class="ccm_container pt-12 pb-12">
      <article class="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 class="text-xl/6 uppercase font-display font-bold tracking-tight">Admin <span class="text-rosso-500 text-3xl/6">.</span></h1>
          <p class="text-sm/5 mt-4 text-gray-500">
            Copia local de las hojas de Google Sheets. Actualiza cuando la hoja original cambie.
          </p>
        </div>

        <UButton
          :loading="refreshingAll"
          :disabled="refreshingAll || refreshingKey !== null"
          @click="refreshAll"
        >
          Actualizar todo
        </UButton>
      </article>

      <div class="divide-y divide-gray-200 border-t border-b border-gray-200">
        <article
          v-for="source in status"
          :key="source.key"
          class="flex items-center justify-between gap-6 py-4"
        >
          <div>
            <h2 class="font-display font-bold tracking-tight">{{ source.label }}</h2>
            <p class="text-xs text-gray-400 mt-1">
              tab: {{ source.tab }} · {{ source.file }} ·
              {{ source.exists ? formatUpdatedAt(source.updatedAt) : 'nunca actualizado' }}
            </p>
            <p v-if="errors[source.key]" class="text-xs text-rosso-500 mt-1">{{ errors[source.key] }}</p>
          </div>

          <UButton
            variant="outline"
            :loading="refreshingKey === source.key"
            :disabled="refreshingAll || refreshingKey !== null"
            @click="refreshOne(source.key)"
          >
            Actualizar
          </UButton>
        </article>
      </div>
    </section>
  </div>
</template>
