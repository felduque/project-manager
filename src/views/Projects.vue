<template>
  <div class="p-4 projects-container">
    <div class="flex justify-end items-center mb-6">
      <Button label="Nuevo Proyecto" icon="pi pi-plus" @click="openProjectModal" class="p-button-primary" />
    </div>

    <div class="mb-4">
      <span class="p-input-icon-left w-full">
        <i class="pi pi-search" />
        <InputText v-model="searchQuery" placeholder="Buscar proyectos..." class="w-full" />
      </span>
    </div>

    <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="project in filteredProjects" :key="project.id" class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="p-4">
          <h2 class="mb-2 font-semibold text-gray-800 text-xl">{{ project.name }}</h2>
          <p class="mb-4 text-gray-600">{{ project.description }}</p>
          <div class="flex justify-between items-center mb-4 text-gray-500 text-sm">
            <span><i class="mr-2 pi pi-list"></i>{{ projectTaskCount(project.id) }} tareas</span>
            <span><i class="mr-2 pi pi-check-circle"></i>{{ completedTaskCount(project.id) }} completadas</span>
          </div>
          <div class="relative pt-1">
            <div class="flex bg-gray-200 mb-4 rounded h-2 text-xs overflow-hidden">
              <div :style="{ width: `${projectProgress(project.id)}%` }" class="flex flex-col justify-center bg-blue-500 shadow-none text-center text-white whitespace-nowrap"></div>
            </div>
          </div>
          <div class="flex justify-end space-x-2">
            <Button icon="pi pi-pencil" class="p-button-text p-button-rounded" @click="editProject(project)" />
            <Button icon="pi pi-trash" class="p-button-danger p-button-text p-button-rounded" @click="confirmDeleteProject(project)" />
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="isProjectModalOpen" :modal="true" :header="editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'" :style="{ width: '50vw' }">
      <div class="p-fluid">
        <div class="mb-4 field">
          <label for="project-name" class="block mb-2 font-medium">Nombre del Proyecto</label>
          <InputText id="project-name" v-model="currentProject.name" required autofocus :class="{'p-invalid': v$.currentProject.name.$invalid && submitted}" />
          <small v-if="v$.currentProject.name.$invalid && submitted" class="p-error">El nombre es requerido</small>
        </div>
        <div class="mb-4 field">
          <label for="project-description" class="block mb-2 font-medium">Descripción</label>
          <Textarea id="project-description" v-model="currentProject.description" rows="3" autoResize />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="closeProjectModal" class="p-button-text" />
        <Button :label="editingProject ? 'Actualizar' : 'Guardar'" icon="pi pi-check" @click="saveProject" autofocus />
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
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import ProgressBar from 'primevue/progressbar'
import ConfirmDialog from 'primevue/confirmdialog'

const store = useStore()
const confirm = useConfirm()
const toast = useToast()

const projects = computed(() => store.state.projects)
const isProjectModalOpen = ref(false)
const currentProject = reactive({ id: null, name: '', description: '' })
const editingProject = ref(false)
const submitted = ref(false)
const searchQuery = ref('')

const rules = {
  currentProject: {
    name: { required }
  }
}

const v$ = useVuelidate(rules, { currentProject })

const filteredProjects = computed(() => {
  return projects.value.filter(project => 
    project.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const projectTaskCount = (projectId) => {
  return store.state.tasks.filter(task => task.projectId === projectId).length
}

const completedTaskCount = (projectId) => {
  return store.state.tasks.filter(task => task.projectId === projectId && task.state === 'Completado').length
}

const projectProgress = (projectId) => {
  const totalTasks = projectTaskCount(projectId)
  const completedTasks = completedTaskCount(projectId)
  return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
}

const openProjectModal = () => {
  editingProject.value = false
  Object.assign(currentProject, { id: null, name: '', description: '' })
  isProjectModalOpen.value = true
}

const closeProjectModal = () => {
  isProjectModalOpen.value = false
  submitted.value = false
}

const saveProject = async () => {
  submitted.value = true
  const isValid = await v$.value.$validate()
  if (!isValid) return

  try {
    if (editingProject.value) {
      await store.dispatch('updateProject', currentProject)
      toast.add({ severity: 'success', summary: 'Proyecto actualizado', detail: 'El proyecto ha sido actualizado exitosamente', life: 3000 })
    } else {
      await store.dispatch('addProject', currentProject)
      toast.add({ severity: 'success', summary: 'Proyecto creado', detail: 'El proyecto ha sido creado exitosamente', life: 3000 })
    }
    closeProjectModal()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  }
}

const editProject = (project) => {
  editingProject.value = true
  Object.assign(currentProject, project)
  isProjectModalOpen.value = true
}

const confirmDeleteProject = (project) => {
  confirm.require({
    message: `¿Estás seguro de que quieres eliminar el proyecto "${project.name}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteProject(project.id)
  })
}

const deleteProject = async (projectId) => {
  try {
    await store.dispatch('deleteProject', { projectId })
    toast.add({ severity: 'success', summary: 'Proyecto eliminado', detail: 'El proyecto ha sido eliminado exitosamente', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  }
}
</script>

<style scoped>
.projects-container {
  max-width: 1200px;
  margin: 0 auto;
}

.p-progressbar {
  height: 6px;
}

.p-button {
  transition: all 0.2s ease;
}

.p-button:hover {
  transform: translateY(-1px);
}
</style>