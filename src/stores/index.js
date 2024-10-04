import { createStore } from 'vuex'
import { v4 as uuidv4 } from 'uuid';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('taskManagerState')
    if (serializedState === null) {
      return undefined
    }
    return JSON.parse(serializedState)
  } catch (err) {
    console.error('Error loading state:', err)
    return undefined
  }
}

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem('taskManagerState', serializedState)
  } catch (err) {
    console.error('Error saving state:', err)
  }
}

export default createStore({
  state: loadState() || {
    tasks: [],
    projects: [
      { id: 1, name: 'Proyecto 1', description: 'Descripción del Proyecto 1' },
      { id: 2, name: 'Proyecto 2', description: 'Descripción del Proyecto 2' },
    ],
    currentProjectId: 1,
    taskStates: ['Por hacer', 'En progreso', 'Completado'],
  },
  mutations: {
    ADD_TASK(state, task) {
      state.tasks.push(task)
      saveState(state)
    },
    UPDATE_TASK(state, updatedTask) {
      const index = state.tasks.findIndex(task => task.id === updatedTask.id)
      if (index !== -1) {
        state.tasks.splice(index, 1, updatedTask)
        saveState(state)
      }
    },
    DELETE_TASK(state, taskId) {
      state.tasks = state.tasks.filter(task => task.id !== taskId)
      saveState(state)
    },
    ADD_PROJECT(state, project) {
      state.projects.push(project)
      saveState(state)
    },
    SET_CURRENT_PROJECT(state, projectId) {
      state.currentProjectId = projectId
      saveState(state)
    },
    DELETE_PROJECT(state, projectId) {
      state.projects = state.projects.filter(project => project.id !== projectId)
      if (state.currentProjectId === projectId) {
        state.currentProjectId = state.projects[0]?.id || null
      }
      saveState(state)
    },
    DELETE_TASKS(state, taskIds) {
      state.tasks = state.tasks.filter(task => !taskIds.includes(task.id))
      saveState(state)
    },
    TRANSFER_TASKS(state, { fromProjectId, toProjectId, taskIds }) {
      state.tasks = state.tasks.map(task => 
        taskIds.includes(task.id) ? { ...task, projectId: toProjectId } : task
      )
      saveState(state)
    },
    UPDATE_PROJECT(state, updatedProject) {
      const index = state.projects.findIndex(project => project.id === updatedProject.id)
      if (index !== -1) {
        state.projects.splice(index, 1, updatedProject)
        saveState(state)
      }
    },
  },
  actions: {
    addTask({ commit, state }, task) {
      if (!task.title.trim()) {
        throw new Error('El título de la tarea no puede estar vacío')
      }
      if (!task.state) {
        throw new Error('Debe seleccionar un estado para la tarea')
      }
      commit('ADD_TASK', { ...task, id: uuidv4(), projectId: state.currentProjectId })
    },
    updateTask({ commit, state }, task) {
      if (!task.title.trim()) {
        throw new Error('El título de la tarea no puede estar vacío')
      }
      if (!task.state) {
        throw new Error('Debe seleccionar un estado para la tarea')
      }
      if (!state.tasks.some(t => t.id === task.id)) {
        throw new Error('La tarea a actualizar no existe')
      }
      commit('UPDATE_TASK', task)
    },
    deleteTask({ commit, state }, taskId) {
      if (!state.tasks.some(t => t.id === taskId)) {
        throw new Error('La tarea a eliminar no existe')
      }
      commit('DELETE_TASK', taskId)
    },
    addProject({ commit, state }, project) {
      if (!project.name.trim()) {
        throw new Error('El nombre del proyecto no puede estar vacío')
      }
      if (state.projects.some(p => p.name === project.name)) {
        throw new Error('Ya existe un proyecto con este nombre')
      }
      const newProject = {
        ...project,
        id: Math.max(0, ...state.projects.map(p => p.id)) + 1
      }
      commit('ADD_PROJECT', newProject)
    },
    setCurrentProject({ commit }, projectId) {
      commit('SET_CURRENT_PROJECT', projectId)
    },
    deleteProject({ commit, state }, { projectId, transferTasks, targetProjectId }) {
      const projectTasks = state.tasks.filter(task => task.projectId === projectId)
      if (transferTasks && targetProjectId) {
        commit('TRANSFER_TASKS', { 
          fromProjectId: projectId, 
          toProjectId: targetProjectId, 
          taskIds: projectTasks.map(task => task.id) 
        })
      } else {
        commit('DELETE_TASKS', projectTasks.map(task => task.id))
      }
      commit('DELETE_PROJECT', projectId)
    },
    updateProject({ commit, state }, project) {
      if (!project.name.trim()) {
        throw new Error('El nombre del proyecto no puede estar vacío')
      }
      if (state.projects.some(p => p.name === project.name && p.id !== project.id)) {
        throw new Error('Ya existe un proyecto con este nombre')
      }
      commit('UPDATE_PROJECT', project)
    },
  },
  getters: {
    currentProject: (state) => {
      return state.projects.find(project => project.id === state.currentProjectId)
    },
    tasksByState: (state) => (stateName) => {
      return state.tasks.filter(task => task.state === stateName && task.projectId === state.currentProjectId)
    },
    tasksByProject: (state) => (projectId) => {
      return state.tasks.filter(task => task.projectId === projectId)
    },
    projectMetrics: (state) => {
      const totalProjects = state.projects.length
      const totalTasks = state.tasks.length
      const completedTasks = state.tasks.filter(task => task.state === 'Completado').length
      
      const tasksByState = state.taskStates.reduce((acc, taskState) => {
        acc[taskState] = state.tasks.filter(task => task.state === taskState).length
        return acc
      }, {})
      
      return {
        totalProjects,
        totalTasks,
        completedTasks,
        tasksByState
      }
    },
    projectTasks: (state) => (projectId) => {
      return state.tasks.filter(task => task.projectId === projectId)
    }
    
  }
})