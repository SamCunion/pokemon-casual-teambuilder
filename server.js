const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "index.html"));
})

app.use("/public", express.static("public"));

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})