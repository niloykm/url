import cors from "cors";
import "dotenv/config";
import express from "express";
import { connectDB } from "./configs/connectDB.config.js";
import { redirecto } from "./routes/redirect.route.js";
import { authRouter } from "./routes/auth.route.js";
import { paymentRouter } from "./routes/payment.route.js";

await connectDB();

const app = express();
const port = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Base route is working fine!");
});

// Auth and payment APIs
app.use("/api/auth", authRouter);
app.use("/api/payment", paymentRouter);

// Redirection and URL handling
app.use("/", redirecto);

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

