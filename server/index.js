import { generateMnemonic, generateKeys, makeTransaction, testing } from "./services/generateKey.js";
import express from "express";
const app = express();
import cors from "cors";
import bodyParser from 'body-parser';

app.use(bodyParser.json());
const PORT = 8000;

app.use(cors());

app.get("/generateMnemonic", generateMnemonic);

app.get("/generateKeys", generateKeys);

app.post("/make-transaction", makeTransaction);

app.get('/testing', testing)

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});