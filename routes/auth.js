import express from "express";
import bcrypt from "bcrypt";
import {isLoggedIn, isNotLoggedIn} from './middlewares';

const router = express.Router();

router.get('/join', isNotLoggedIn, async(req, res, next) => {
    const { user_id, name, password } = req.body;
    try {
        const exUser = await User.find({ where: {user_id} });
        if(exUser) {
            alert('이미 가입한 이메일 입니다.');
            return res.redirect('/join');
        }
        
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            user_id,
            name,
            password,
        })
        return res.redirect('/');
    } catch (err) {
        console.error(err);
    }
});
 
export default router;