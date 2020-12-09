// initalize an express app with default settings
import express from "express"
import nunjucks from "nunjucks"

const app = express()

app.set("json spaces", 2)

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  next()
})

app.use(express.static("./static"))

app.set("views", "../views")
app.set("view engine", "html")
nunjucks.configure("views", { express: app, autoescape: true })

export default app
