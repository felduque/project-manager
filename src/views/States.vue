<template>
    <div>
      <h1 class="mb-6 font-semibold text-3xl text-gray-800">Estados</h1>
      
      <!-- Formulario para agregar estado -->
      <form @submit.prevent="addState" class="mb-8">
        <input v-model="newState" type="text" placeholder="Nuevo estado" class="mr-2 px-4 py-2 border rounded-lg">
        <button type="submit" class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white" :disabled="states.length >= 6">
          Agregar Estado
        </button>
      </form>
  
      <!-- Lista de estados -->
      <div class="gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div v-for="state in states" :key="state" class="bg-white shadow p-4 rounded-lg">
          {{ state }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useStore } from 'vuex'
  
  const store = useStore()
  const states = computed(() => store.state.states)
  
  const newState = ref('')
  
  const addState = () => {
    if (newState.value.trim() && states.value.length < 6) {
      store.dispatch('addState', newState.value)
      newState.value = ''
    }
  }
  </script>