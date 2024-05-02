import { generateMnemonic } from "./services/generateKey.js";
import express from "express";
const app = express();
import cors from "cors";
const PORT = 8000;

app.use(cors());

app.get("/generateMnemonic", generateMnemonic);



app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});