import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Tasks from '@/views/Tasks.vue'
import States from '@/views/States.vue'
import Projects from '@/views/Projects.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: Tasks
    },
    {
      path: '/states',
      name: 'states',
      component: States
    },
    {
      path: '/projects',
      name: 'projects',
      component: Projects
    }

  ]
})
export default router
