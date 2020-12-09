import app from "./src/app"
import config from "./src/config"
import { enrichHandler, indexingHandler } from "./src/enrich"
import schemes from "./data/schemes"
import databases from "./data/databases"

app.get("/", (req, res) => res.render("index") )
app.get("/terminologies", (req, res) => res.render("terminologies") )
app.get("/api", (req, res) => res.render("api") )

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
  res.status(error.statusCode)
  res.json(error)
})

app.listen(config.port, () => {
  console.log(`Now listening on port ${config.port}`)
})
