// TODO: Merge with novo/src/server.ts
import express from "express"

const novo = express()

novo.use(require("./src/server"))

export default novo
