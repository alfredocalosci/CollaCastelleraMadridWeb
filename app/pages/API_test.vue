<template>
  <section class="p-8  m-4 ">
    <h2 class="font-bold text-lg my-4">Sheets API Test</h2>
    <div class="flex gap-2 mb-2">
      <button v-for="tab in knownTabs" :key="tab" @click="testTab = tab"
        class="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">{{ tab }}</button>
    </div>

    <div class="flex gap-2 mb-4">
      <input v-model="testTab" placeholder="Tab name..." class="border px-2 py-1 rounded flex-1" />
      <button @click="fetchTab" class="bg-blue-500 text-white px-4 py-1 rounded">Fetch</button>
    </div>

    <p v-if="testError" class="text-red-600">{{ testError }}</p>
    <pre v-if="testData" class="text-xs bg-white border p-4 overflow-auto max-h-64">{{ testData }}</pre>
  </section>
</template>

<script lang="ts" setup>
  const knownTabs = ['WEB_HOME_CAROUSEL', 'WEB_HOME_GALLERY' ,'WEB_CALENDARIO', 'DAT_ACTUACIONES']
  const testTab = ref('')
  const testData = ref<string | null>(null)
  const testError = ref<string | null>(null)

  async function fetchTab() {
    testData.value = null
    testError.value = null
    try {
      testData.value = await $fetch<string>(`/api/sheets?tab=${testTab.value}`)
    } catch (e: any) {
      testError.value = e?.data?.statusMessage ?? 'Error desconocido'
    }
  }
</script>
