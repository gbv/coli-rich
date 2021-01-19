import express from "express"
import nunjucks from "nunjucks"

import config from "./config"
import { enrichHandler, indexingHandler } from "./src/enrich"
import schemes from "./data/schemes"
import databases from "./data/databases"

const app = express()

app.set("json spaces", 2)

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  next()
})

app.use(express.static("./static"))
app.use("/dist/", express.static("dist"))

app.set("views", "../views")
app.set("view engine", "html")
nunjucks.configure("views", { express: app, autoescape: true })

const pages = {
  "": config.title,
  voc: "Vokabulare",
  indexing: "Sacherschließung",
  mappings: "Mappings",
  api: "API",
}
for (let [path, title] of Object.entries(pages)) {
  app.get(`/${path}`, (req, res) => res.render(path || "index", { pages, title, path, config }) )
}

app.get("/api/config", (req, res) => res.json(config))
app.get("/api/voc", (req, res) => res.json(schemes))
app.get("/api/databases", (req, res) => res.json(databases))
app.get("/api/indexing", indexingHandler)
app.get("/api/enrich", enrichHandler)

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const error = {
    statusCode: err.statusCode || 500,
    message: err.message,
  }
  console.error(err)
  res.status(error.statusCode)
  res.json(error)
})

app.listen(config.port, () => {
  console.log(`Now listening on port ${config.port}`)
})
