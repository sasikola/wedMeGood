const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://sasikola5:Sasikiran9010@cluster0.bjoek5y.mongodb.net/StayHealthy?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Mongodb Connected...");
  })
  .catch((err) => console.log("Error in connecting DB", err));
