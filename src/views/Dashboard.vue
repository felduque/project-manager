<template>
  <div class="p-4 dashboard-container">

    <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <div v-for="(stat, index) in stats" :key="index" class="flex items-center bg-white shadow-md p-6 rounded-lg">
        <div :class="`text-${stat.color}-500 bg-${stat.color}-100 p-3 rounded-full mr-4`">
          <i :class="`pi ${stat.icon} text-xl`"></i>
        </div>
        <div>
          <h3 class="font-semibold text-gray-700 text-lg">{{ stat.title }}</h3>
          <p class="font-bold text-2xl text-gray-900">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="gap-6 grid grid-cols-1 lg:grid-cols-2 mb-8">
      <div class="bg-white shadow-md p-6 rounded-lg">
        <h2 class="mb-4 font-semibold text-gray-800 text-xl">Distribución de Tareas por Estado</h2>
        <Chart type="pie" :data="taskStatusChartData" :options="chartOptions" class="h-64" />
      </div>
      <div class="bg-white shadow-md p-6 rounded-lg">
        <h2 class="mb-4 font-semibold text-gray-800 text-xl">Tareas por Proyecto</h2>
        <Chart type="bar" :data="tasksPerProjectChartData" :options="chartOptions" class="h-64" />
      </div>
    </div>

    <div class="gap-6 grid grid-cols-1 lg:grid-cols-2">
      <div class="bg-white shadow-md p-6 rounded-lg">
        <h2 class="mb-4 font-semibold text-gray-800 text-xl">Tareas Recientes</h2>
        <ul class="space-y-3">
          <li v-for="task in recentTasks" :key="task.id" class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <div>
              <h4 class="font-medium text-gray-800">{{ task.title }}</h4>
              <p class="text-gray-600 text-sm">{{ task.project }}</p>
            </div>
            <span :class="`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(task.state)}`">
              {{ task.state }}
            </span>
          </li>
        </ul>
      </div>
      <div class="bg-white shadow-md p-6 rounded-lg">
        <h2 class="mb-4 font-semibold text-gray-800 text-xl">Calendario de Proyectos</h2>
        <Calendar v-model="selectedDate" :inline="true" :showWeek="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import Chart from 'primevue/chart';
import Calendar from 'primevue/calendar';

const store = useStore();
const selectedDate = ref(new Date());

const stats = computed(() => [
  { title: 'Total Proyectos', value: store.state.projects.length, icon: 'pi-folder', color: 'blue' },
  { title: 'Total Tareas', value: store.state.tasks.length, icon: 'pi-list', color: 'green' },
  { title: 'Tareas Completadas', value: store.state.tasks.filter(t => t.state === 'Completado').length, icon: 'pi-check-circle', color: 'teal' },
  { title: 'Tareas Pendientes', value: store.state.tasks.filter(t => t.state !== 'Completado').length, icon: 'pi-clock', color: 'yellow' },
]);

const taskStatusChartData = computed(() => {
  const tasksByState = store.state.taskStates.reduce((acc, state) => {
    acc[state] = store.state.tasks.filter(task => task.state === state).length;
    return acc;
  }, {});

  return {
    labels: Object.keys(tasksByState),
    datasets: [{
      data: Object.values(tasksByState),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
    }]
  };
});

const tasksPerProjectChartData = computed(() => {
  const projectNames = store.state.projects.map(project => project.name);
  const tasksPerProject = store.state.projects.map(project => 
    store.state.tasks.filter(task => task.projectId === project.id).length
  );

  return {
    labels: projectNames,
    datasets: [{
      label: 'Número de Tareas',
      data: tasksPerProject,
      backgroundColor: '#36A2EB',
      borderColor: '#36A2EB',
      borderWidth: 1
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#495057'
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#495057'
      },
      grid: {
        color: '#ebedef'
      }
    },
    x: {
      ticks: {
        color: '#495057'
      },
      grid: {
        color: '#ebedef'
      }
    }
  }
};

const recentTasks = computed(() => {
  return store.state.tasks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(task => ({
      ...task,
      project: store.state.projects.find(p => p.id === task.projectId)?.name || 'Sin proyecto'
    }));
});

const getStatusClass = (status) => {
  switch (status) {
    case 'Por hacer': return 'bg-yellow-100 text-yellow-800';
    case 'En progreso': return 'bg-blue-100 text-blue-800';
    case 'Completado': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

:deep(.p-calendar) {
  width: 100%;
}

:deep(.p-datepicker) {
  width: 100%;
  min-width: 320px;
}

:deep(.p-chart) {
  height: 300px;
}
</style>