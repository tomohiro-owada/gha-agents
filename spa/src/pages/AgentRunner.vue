<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const prompt = ref('')
const isRunning = ref(false)
const runId = ref<string | null>(null)
const status = ref<'idle' | 'queued' | 'in_progress' | 'completed' | 'failure'>('idle')
const steps = ref<Array<{ name: string; status: 'pending' | 'in_progress' | 'completed' | 'failure' }>>([])
const result = ref<string | null>(null)
const error = ref<string | null>(null)

const API_BASE = import.meta.env.VITE_API_BASE || 'https://pay4words.com'

async function runAgent() {
  if (!prompt.value.trim()) return

  isRunning.value = true
  status.value = 'queued'
  error.value = null
  result.value = null
  steps.value = []

  try {
    const triggerRes = await fetch(`${API_BASE}/api/agents/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt.value })
    })

    if (!triggerRes.ok) {
      throw new Error('Failed to trigger workflow')
    }

    const triggerData = await triggerRes.json()
    runId.value = triggerData.run_id

    pollStatus()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
    isRunning.value = false
    status.value = 'failure'
  }
}

async function pollStatus() {
  if (!runId.value) return

  try {
    const res = await fetch(`${API_BASE}/api/agents/status/${runId.value}`)
    const data = await res.json()

    status.value = data.status
    steps.value = data.steps || []

    if (data.status === 'completed') {
      result.value = data.result
      isRunning.value = false
    } else if (data.status === 'failure') {
      error.value = data.error || 'Workflow failed'
      isRunning.value = false
    } else {
      setTimeout(pollStatus, 5000)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch status'
    isRunning.value = false
    status.value = 'failure'
  }
}

function getStepIcon(stepStatus: string) {
  switch (stepStatus) {
    case 'completed': return '✅'
    case 'in_progress': return '🔄'
    case 'failure': return '❌'
    default: return '⬜'
  }
}
</script>

<template>
  <div class="min-h-screen bg-background p-8">
    <div class="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>GHA Agents</CardTitle>
          <CardDescription>
            GitHub Actions でエージェントを実行
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <Textarea
            v-model="prompt"
            placeholder="プロンプトを入力..."
            :disabled="isRunning"
            class="min-h-32"
          />
        </CardContent>
        <CardFooter>
          <Button
            @click="runAgent"
            :disabled="isRunning || !prompt.trim()"
            class="w-full"
          >
            {{ isRunning ? '実行中...' : '実行' }}
          </Button>
        </CardFooter>
      </Card>

      <Card v-if="status !== 'idle'">
        <CardHeader>
          <CardTitle class="text-lg">
            {{ status === 'queued' ? '⏳ キュー待ち...' :
               status === 'in_progress' ? '🔄 実行中...' :
               status === 'completed' ? '✅ 完了' :
               status === 'failure' ? '❌ 失敗' : '' }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="steps.length > 0" class="space-y-2">
            <div
              v-for="step in steps"
              :key="step.name"
              class="flex items-center gap-2 text-sm"
            >
              <span>{{ getStepIcon(step.status) }}</span>
              <span :class="{ 'text-muted-foreground': step.status === 'pending' }">
                {{ step.name }}
              </span>
            </div>
          </div>

          <div v-if="result" class="mt-4 p-4 bg-muted rounded-md">
            <pre class="text-sm whitespace-pre-wrap">{{ result }}</pre>
          </div>

          <div v-if="error" class="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
            {{ error }}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
