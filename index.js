const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const dbConnect = require("./Config/DBConnect");
dotenv.config();
dbConnect()

app.get("/", (req, res) => {
    res.send("Hello World!");
});


app.use(express.json());
app.use(cors());
app.use("/api/v1", require("./Routes/routes"))

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`)
});
