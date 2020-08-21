// Load vue
import { createApp } from "vue"
import App from "./App.vue"
const app = createApp(App)

// Load and configure vue-router
import { createRouter, createWebHistory } from "vue-router"
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: import.meta.env.BASE_URL, component: App },
  ],
})
app.use(router)

// Import CSS
import "./styles/main.css"

// Provide libraries to components
// jskos-tools: add `inject: ["jskos"]` and use via `this.jskos`
import jskos from "jskos-tools"
app.provide("jskos", jskos)

app.mount("#app")
