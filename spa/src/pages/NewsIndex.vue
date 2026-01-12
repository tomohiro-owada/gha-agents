<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const dates = ref<string[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const API_BASE = import.meta.env.VITE_API_BASE || 'https://pay4words.com'

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE}/api/news`)
    const data = await res.json()
    if (data.success) {
      dates.value = data.dates
    } else {
      error.value = data.message || 'Failed to load news list'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load news list'
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-')
  const year = parts[0] || ''
  const month = parts[1] || ''
  const day = parts[2] || ''
  return `${year}年${parseInt(month)}月${parseInt(day)}日`
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-8">
    <div class="max-w-4xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Philippines News</h1>
        <p class="text-slate-600 mt-2">フィリピンの最新ニュースを日本語で</p>
      </header>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-blue-600"></div>
        <p class="mt-4 text-slate-600">読み込み中...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {{ error }}
      </div>

      <div v-else-if="dates.length === 0" class="text-center py-12 text-slate-500">
        ニュースがまだありません
      </div>

      <div v-else class="grid gap-4">
        <RouterLink
          v-for="date in dates"
          :key="date"
          :to="`/news/${date}`"
          class="block"
        >
          <Card class="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 bg-white">
            <CardHeader>
              <CardTitle class="text-xl text-slate-900">
                {{ formatDate(date) }}
              </CardTitle>
              <CardDescription class="text-slate-500">
                {{ date }}
              </CardDescription>
            </CardHeader>
          </Card>
        </RouterLink>
      </div>

      <footer class="mt-12 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
        <RouterLink to="/" class="text-blue-600 hover:underline">
          Agent Runner に戻る
        </RouterLink>
      </footer>
    </div>
  </div>
</template>
