<template>
  <div class="flex bg-gray-50 min-h-screen">
    <aside 
      class="bg-indigo-700 p-6 w-72 min-h-screen text-white transition-all duration-300 ease-in-out"
    >
      <div class="flex justify-between items-center mb-10">
        <h1 class="font-bold text-2xl tracking-tight">Gestor de Proyectos</h1>
      </div>
      <nav class="space-y-2">
        <router-link 
          v-for="(link, index) in navLinks" 
          :key="index"
          :to="link.to" 
          class="flex items-center hover:bg-indigo-600 px-4 py-3 rounded-lg transition duration-200"
          :class="{ 'bg-indigo-800 font-medium': $route.path === link.to }"
        >
          <i :class="['mr-3 text-xl', link.icon]"></i>
          {{ link.text }}
        </router-link>
      </nav>
    </aside>

    <div class="flex flex-col flex-1 overflow-hidden">
      <header class="bg-white shadow-sm p-4">
        <div class="flex justify-between items-center mx-auto container">
          <h2 class="font-semibold text-2xl text-gray-800">{{ pageTitle }}</h2>
          <div class="flex items-center space-x-4">
            <label for="project-selector" class="font-medium text-gray-700">Proyecto actual:</label>
            <Dropdown
              id="project-selector"
              v-model="currentProjectId"
              :options="projects"
              optionLabel="name"
              filter="true"
              optionValue="id"
              placeholder="Seleccione un proyecto"
              class="w-64"
            />
          </div>
        </div>
      </header>

      <main class="flex-1 bg-gray-50 p-8 overflow-x-hidden overflow-y-auto">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import Dropdown from 'primevue/dropdown'

const store = useStore()
const router = useRouter()
const route = useRoute()

const projects = computed(() => store.state.projects)
const currentProjectId = computed({
  get: () => store.state.currentProjectId,
  set: (value) => {
    store.dispatch('setCurrentProject', value)
    if (router.currentRoute.value.path === '/tasks') {
      router.go()
    }
  }
})

const navLinks = [
  { to: '/', icon: 'pi pi-home', text: 'Panel' },
  { to: '/projects', icon: 'pi pi-folder', text: 'Proyectos' },
  { to: '/tasks', icon: 'pi pi-list', text: 'Tareas' }
]

const pageTitle = computed(() => {
  switch (route.path) {
    case '/': return 'Panel'
    case '/projects': return 'Proyectos'
    case '/tasks': return 'Tareas'
    default: return 'Task Manager'
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}

.p-dropdown {
  border-radius: 0.5rem;
}

.p-dropdown:not(.p-disabled).p-focus {
  box-shadow: 0 0 0 2px #C7D2FE;
  border-color: #818CF8;
}

.p-dropdown .p-dropdown-label {
  padding: 0.75rem 1rem;
}

.p-dropdown .p-dropdown-trigger {
  padding: 0 1rem;
}
</style>