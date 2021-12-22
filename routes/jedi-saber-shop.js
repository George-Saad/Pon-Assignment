import { addSaber, getSaber, addOrder } from "../controllers/jedi-saber-shop.js";
import express from "express";

const router = express.Router();

router.post('/saber', addSaber);

router.get('/saber/:id', getSaber);

router.post('/order/saber/', addOrder);

export default router;