import express from "express";
 
const router = express.Router();

router.get('/', (req, res) => {
    res.send("회원가입 페이지!!!");
});

export default router;