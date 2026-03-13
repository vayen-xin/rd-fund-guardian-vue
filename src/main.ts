import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import { useAppStore } from './stores/app'
import './styles/index.scss'

const app = createApp(App)
const pinia = createPinia()

// 持久化插件
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

// 初始化主题
const appStore = useAppStore()
appStore.initTheme()

app.mount('#app')
