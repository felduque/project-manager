<template>
  <div class="tasks-container">
    <div class="flex justify-between items-center mb-6">
      <h2 class="font-semibold text-2xl text-gray-800">Tareas del proyecto: {{ currentProject.name }}</h2>
      <Button label="Nueva Tarea" icon="pi pi-plus" @click="openTaskModal" class="p-button-primary" />
    </div>

    <div class="mb-4">
      <span class="p-input-icon-left w-full">
        <i class="pi pi-search" />
        <InputText v-model="searchQuery" placeholder="Buscar tareas..." class="w-full" />
      </span>
    </div>

    <div class="gap-6 grid grid-cols-1 md:grid-cols-3">
      <div v-for="state in taskStates" :key="state" class="bg-white shadow-md p-4 rounded-lg">
        <h3 class="flex items-center mb-4 font-semibold text-lg">
          <span :class="getStateColor(state)" class="mr-2 rounded-full w-3 h-3"></span>
          {{ state }}
        </h3>
        <draggable 
          :list="filteredTasks(state)" 
          group="tasks" 
          @change="(e) => onDragChange(e, state)"
          item-key="id"
          class="space-y-3 min-h-[100px]"
        >
          <template #item="{ element }">
            <div 
              class="bg-gray-50 shadow-sm hover:shadow-md p-4 rounded-lg transition-all duration-200 cursor-move"
              :class="{ 'opacity-50': element.completed }"
            >
              <div class="flex justify-between items-start">
                <h4 class="font-medium text-gray-800" :class="{ 'line-through': element.completed }">{{ element.title }}</h4>
                <div class="flex space-x-2">
                  <Button icon="pi pi-check" class="p-button-sm p-button-text p-button-rounded" @click="toggleTaskCompletion(element)" :class="{ 'text-green-500': element.completed }" />
                  <Button icon="pi pi-pencil" class="p-button-sm p-button-text p-button-rounded" @click="editTask(element)" />
                  <Button icon="pi pi-trash" class="p-button-danger p-button-sm p-button-text p-button-rounded" @click="confirmDeleteTask(element)" />
                </div>
              </div>
              <p class="mt-2 text-gray-600 text-sm">{{ element.description }}</p>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <Dialog v-model:visible="isTaskModalOpen" :modal="true" :header="editingTask ? 'Editar Tarea' : 'Nueva Tarea'" :style="{ width: '50vw' }">
      <div class="p-fluid">
        <div class="mb-4 field">
          <label for="task-title" class="block mb-2 font-medium">Título de la tarea</label>
          <InputText id="task-title" v-model="currentTask.title" required autofocus :class="{'p-invalid': v$.currentTask.title.$invalid && submitted}" />
          <small v-if="v$.currentTask.title.$invalid && submitted" class="p-error">El título es requerido</small>
        </div>
        <div class="mb-4 field">
          <label for="task-description" class="block mb-2 font-medium">Descripción</label>
          <Textarea id="task-description" v-model="currentTask.description" rows="3" autoResize />
        </div>
        <div class="mb-4 field">
          <label for="task-state" class="block mb-2 font-medium">Estado</label>
          <Dropdown id="task-state" v-model="currentTask.state" :options="taskStates" placeholder="Seleccione un estado" :class="{'p-invalid': v$.currentTask.state.$invalid && submitted}" />
          <small v-if="v$.currentTask.state.$invalid && submitted" class="p-error">El estado es requerido</small>
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="closeTaskModal" class="p-button-text" />
        <Button :label="editingTask ? 'Actualizar' : 'Guardar'" icon="pi pi-check" @click="saveTask" autofocus />
      </template>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useStore } from 'vuex'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import draggable from 'vuedraggable'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import ConfirmDialog from 'primevue/confirmdialog'

const store = useStore()
const confirm = useConfirm()
const toast = useToast()

const currentProject = computed(() => store.getters.currentProject)
const taskStates = computed(() => store.state.taskStates)
const tasks = computed(() => store.getters.tasksByProject(currentProject.value.id))

const isTaskModalOpen = ref(false)
const currentTask = reactive({ id: null, title: '', description: '', state: '', completed: false })
const editingTask = ref(false)
const submitted = ref(false)
const searchQuery = ref('')

const rules = {
  currentTask: {
    title: { required },
    state: { required }
  }
}

const v$ = useVuelidate(rules, { currentTask })

const filteredTasks = (state) => {
  return tasks.value
    .filter(task => task.state === state)
    .filter(task => task.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
}

const getStateColor = (state) => {
  switch (state) {
    case 'Por hacer': return 'bg-yellow-500'
    case 'En progreso': return 'bg-blue-500'
    case 'Completado': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

const openTaskModal = () => {
  editingTask.value = false
  Object.assign(currentTask, { id: null, title: '', description: '', state: taskStates.value[0], completed: false })
  isTaskModalOpen.value = true
}

const closeTaskModal = () => {
  isTaskModalOpen.value = false
  submitted.value = false
}

const saveTask = async () => {
  submitted.value = true
  const isValid = await v$.value.$validate()
  if (!isValid) return

  try {
    if (editingTask.value) {
      await store.dispatch('updateTask', currentTask)
      toast.add({ severity: 'success', summary: 'Tarea actualizada', detail: 'La tarea ha sido actualizada exitosamente', life: 3000 })
    } else {
      await store.dispatch('addTask', { ...currentTask, projectId: currentProject.value.id })
      toast.add({ severity: 'success', summary: 'Tarea creada', detail: 'La tarea ha sido creada exitosamente', life: 3000 })
    }
    closeTaskModal()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  }
}

const editTask = (task) => {
  editingTask.value = true
  Object.assign(currentTask, task)
  isTaskModalOpen.value = true
}

const confirmDeleteTask = (task) => {
  confirm.require({
    message: '¿Estás seguro de que quieres eliminar esta tarea?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteTask(task.id)
  })
}

const deleteTask = async (taskId) => {
  try {
    await store.dispatch('deleteTask', taskId)
    toast.add({ severity: 'success', summary: 'Tarea eliminada', detail: 'La tarea ha sido eliminada exitosamente', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  }
}

const toggleTaskCompletion = (task) => {
  store.dispatch('updateTask', { ...task, completed: !task.completed })
}

const onDragChange = (evt, newState) => {
  if (evt.added) {
    const task = evt.added.element
    store.dispatch('updateTask', { ...task, state: newState })
  }
}
</script>

<style scoped>
.p-button {
  transition: all 0.2s ease;
}
.p-button:hover {
  transform: translateY(-1px);
}
</style>