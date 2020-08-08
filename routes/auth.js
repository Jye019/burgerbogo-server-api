import express from "express";
import { isLoggedIn, isNotLoggedIn } from "./middleware";

const router = express.Router();

export default router;
