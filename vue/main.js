import { createApp } from "vue"

import App from "./App.vue"
const app = createApp(App)

// Load and configure vue-router
import { createRouter, createWebHistory } from "vue-router"
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/:catchAll(.*)", component: App },
  ],
})
app.use(router)

app.mount("#app")
