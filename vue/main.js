import { createApp } from "vue"

import App from "./App.vue"
const app = createApp(App)

// Load and configure vue-router
import { createRouter, createWebHistory } from "vue-router"
const router = createRouter({
  history: createWebHistory(),
  routes: [ { path: "/:catchAll(.*)", component: App } ],
})
app.use(router)
router.afterEach((to) => {
  // Really dirty workaround for a router issue where slashes get replaced by %2F
  if (to.fullPath.includes("%2F")) {
    const newPath = to.fullPath.replaceAll("%2F", "/")
    history.replaceState({}, null, newPath)
  }
})

app.mount("#app")
