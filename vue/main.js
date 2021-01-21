import { createApp } from "vue"

import App from "./App.vue"
const app = createApp(App)

// Load and configure vue-router
import { createRouter, createWebHistory } from "vue-router"
app.use(createRouter({
  history: createWebHistory(),
  routes: [ { path: "/:catchAll(.*)", component: App } ],
}))

app.mount("#app")
