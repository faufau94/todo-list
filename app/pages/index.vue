<script setup lang="ts">
interface Todo {
  id: number
  title: string
  desc: string
  completed: boolean
  createdAt: string
}

const todos = ref<Todo[]>([])
const newTitle = ref('')
const newDesc = ref('')
const editingId = ref<number | null>(null)
const editTitle = ref('')
const editDesc = ref('')

async function fetchTodos() {
  todos.value = await $fetch<Todo[]>('/api')
}

async function addTodo() {
  if (!newTitle.value.trim()) return
  await $fetch('/api/post', {
    method: 'POST',
    body: { title: newTitle.value.trim(), desc: newDesc.value.trim() },
  })
  newTitle.value = ''
  newDesc.value = ''
  await fetchTodos()
}

async function deleteTodo(id: number) {
  await $fetch('/api/delete', {
    method: 'DELETE',
    params: { id },
  })
  await fetchTodos()
}

function startEdit(todo: Todo) {
  editingId.value = todo.id
  editTitle.value = todo.title
  editDesc.value = todo.desc
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(id: number) {
  await $fetch('/api/update', {
    method: 'PUT',
    body: { id, title: editTitle.value.trim(), desc: editDesc.value.trim() },
  })
  editingId.value = null
  await fetchTodos()
}

async function toggleCompleted(todo: Todo) {
  await $fetch('/api/update', {
    method: 'PUT',
    body: { id: todo.id, title: todo.title, desc: todo.desc, completed: !todo.completed },
  })
  await fetchTodos()
}

onMounted(fetchTodos)
</script>

<template>
  <div class="min-h-screen bg-stone-50 py-12 px-4">
    <div class="max-w-xl mx-auto">
      <h1 class="text-3xl font-light text-stone-800 mb-8 tracking-tight">Notes</h1>

      <!-- Add form -->
      <form @submit.prevent="addTodo" class="mb-10">
        <input
          v-model="newTitle"
          type="text"
          placeholder="Titre"
          class="w-full bg-white border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
          @keydown.enter.prevent="addTodo"
        />
        <textarea
          v-model="newDesc"
          placeholder="Description (optionnel)"
          rows="2"
          class="w-full mt-2 bg-white border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors resize-none"
          @keydown.enter.exact.prevent="addTodo"
        />
        <button
          type="submit"
          class="mt-3 w-full bg-stone-800 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-stone-700 transition-colors cursor-pointer"
        >
          Ajouter
        </button>
      </form>

      <!-- Empty state -->
      <p v-if="todos.length === 0" class="text-center text-stone-400 text-sm py-8">
        Aucune note pour le moment.
      </p>

      <!-- Todo list -->
      <ul class="space-y-3">
        <li
          v-for="todo in todos"
          :key="todo.id"
          class="bg-white border border-stone-200 rounded-lg px-4 py-3 group"
        >
          <!-- View mode -->
          <div v-if="editingId !== todo.id" class="flex items-start gap-3">
            <button
              @click="toggleCompleted(todo)"
              class="mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors cursor-pointer"
              :class="todo.completed ? 'bg-stone-800 border-stone-800' : 'border-stone-300 hover:border-stone-400'"
            >
              <svg v-if="todo.completed" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>

            <div class="flex-1 min-w-0" @dblclick="startEdit(todo)">
              <p
                class="text-stone-800 text-sm font-medium"
                :class="{ 'line-through text-stone-400': todo.completed }"
              >
                {{ todo.title }}
              </p>
              <p
                v-if="todo.desc"
                class="text-stone-500 text-xs mt-0.5"
                :class="{ 'line-through text-stone-300': todo.completed }"
              >
                {{ todo.desc }}
              </p>
            </div>

            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="startEdit(todo)"
                class="p-1 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                @click="deleteTodo(todo.id)"
                class="p-1 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Edit mode -->
          <div v-else>
            <input
              v-model="editTitle"
              type="text"
              class="w-full bg-stone-50 border border-stone-200 rounded px-3 py-1.5 text-sm text-stone-800 focus:outline-none focus:border-stone-400 transition-colors"
            />
            <textarea
              v-model="editDesc"
              rows="2"
              class="w-full mt-1.5 bg-stone-50 border border-stone-200 rounded px-3 py-1.5 text-sm text-stone-800 focus:outline-none focus:border-stone-400 transition-colors resize-none"
            />
            <div class="flex gap-2 mt-2">
              <button
                @click="saveEdit(todo.id)"
                class="px-3 py-1 bg-stone-800 text-white text-xs rounded hover:bg-stone-700 transition-colors cursor-pointer"
              >
                Enregistrer
              </button>
              <button
                @click="cancelEdit"
                class="px-3 py-1 bg-stone-100 text-stone-600 text-xs rounded hover:bg-stone-200 transition-colors cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
