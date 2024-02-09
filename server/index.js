const express = require("express");
const router = require("./Routers/userRoute");
const cors = require("cors");
require("./db");
const port = 5000

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
// app.use(cors())
app.use(express.json());
app.use("/api/user", router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
