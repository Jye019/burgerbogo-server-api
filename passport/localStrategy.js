import bcrypt from 'bcrypt';
import {User} from '../models';
import {Strategy} from 'passport-local';

module.exports = (passport) => {
    passport.use(new Strategy({
        usernameField: 'user_id',
        passwordField: 'password',
    }, async(user_id, password, done) => {
        try {
            const exUser = await User.find({ where: {email}});
            if(exUser) {
                const result = await bcrypt.compare(password, exUser.password);
                if(result) {
                    done(null, exUser);
                } else {
                    done(null, false, {message: '비밀번호가 일치하지 않습니다.'});
                }
            } else {
                done(null, false, {message: '가입되지 않은 회원입니다.'});
            }
        } catch(err) {
            console.error(err);
            done(err);
        }
    }));
}