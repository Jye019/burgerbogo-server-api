import express from "express";
import sequelize from "./../models/index";
 
const router = express.Router();

router.get('/', async(req, res, next) => {
    try {
        const users = await sequelize.User;
        users.findAll()
            .then((p) => {
                res.json(p)
            })
    } catch(err) {
        console.log(err);
        next(err);
    }
});
 
export default router;