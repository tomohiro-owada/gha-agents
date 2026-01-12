<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface NewsArticle {
  title_original: string
  title_ja: string
  description_original: string
  description_ja: string
  link: string
  image: string | null
  pub_date: string
}

const route = useRoute()
const date = route.params.date as string

const articles = ref<NewsArticle[]>([])
const generatedAt = ref<string | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const API_BASE = import.meta.env.VITE_API_BASE || 'https://pay4words.com'

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE}/api/news/${date}`)
    const data = await res.json()
    if (data.success) {
      articles.value = data.articles
      generatedAt.value = data.generated_at
    } else {
      error.value = data.message || 'Failed to load news'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load news'
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

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <RouterLink to="/news" class="text-blue-600 hover:underline text-sm">
            ← ニュース一覧
          </RouterLink>
          <h1 class="text-2xl font-bold text-slate-900 mt-1">{{ formatDate(date) }}</h1>
        </div>
        <div v-if="generatedAt" class="text-sm text-slate-500">
          更新: {{ new Date(generatedAt).toLocaleString('ja-JP') }}
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-8">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-blue-600"></div>
        <p class="mt-4 text-slate-600">読み込み中...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {{ error }}
      </div>

      <div v-else-if="articles.length === 0" class="text-center py-12 text-slate-500">
        ニュースがありません
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          v-for="(article, index) in articles"
          :key="index"
          :href="article.link"
          target="_blank"
          rel="noopener noreferrer"
          class="block group"
        >
          <Card class="h-full overflow-hidden hover:shadow-xl transition-shadow border-slate-200 bg-white">
            <div v-if="article.image" class="aspect-video bg-slate-100 overflow-hidden">
              <img
                :src="article.image"
                :alt="article.title_ja"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="handleImageError"
              />
            </div>
            <div v-else class="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <span class="text-4xl text-slate-400">📰</span>
            </div>
            <CardHeader class="pb-2">
              <CardTitle class="text-lg leading-snug text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {{ article.title_ja }}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-slate-600 text-sm line-clamp-3">
                {{ article.description_ja }}
              </p>
              <p class="text-slate-400 text-xs mt-3 line-clamp-1">
                {{ article.title_original }}
              </p>
            </CardContent>
          </Card>
        </a>
      </div>
    </main>

    <footer class="border-t border-slate-200 bg-white mt-12">
      <div class="max-w-6xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
        <p>Source: <a href="https://www.philstar.com" target="_blank" class="text-blue-600 hover:underline">PhilStar.com</a></p>
        <p class="mt-2">
          <RouterLink to="/" class="text-blue-600 hover:underline">Agent Runner</RouterLink>
          ・
          <RouterLink to="/news" class="text-blue-600 hover:underline">News Index</RouterLink>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
