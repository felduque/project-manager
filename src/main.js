import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import store from './stores'

import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

import 'primevue/resources/themes/lara-light-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

import Calendar from 'primevue/calendar'
import Chart from 'primevue/chart'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import ProgressBar from 'primevue/progressbar'
import ConfirmDialog from 'primevue/confirmdialog'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(store)

app.use(PrimeVue, { ripple: true })
app.use(ConfirmationService)
app.use(ToastService)

app.component('Calendar', Calendar)
app.component('Chart', Chart)
app.component('Button', Button)
app.component('Dialog', Dialog)
app.component('InputText', InputText)
app.component('Textarea', Textarea)
app.component('ProgressBar', ProgressBar)
app.component('ConfirmDialog', ConfirmDialog)

app.mount('#app')