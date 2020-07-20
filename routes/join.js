import express from "express";
import userModel from "../models/user";
 
const router = express.Router();

router.get('/', async(req, res) => {
    const users = await userModel.findAll();
    res.send(users);
});

export default router;