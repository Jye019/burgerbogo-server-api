import local from './localStrategy';
import {User} from '../models';

module.exports = () => {
    console.log(passport)
    console.log(1111)
    passport.serializeUser((user, done) => {
        done(null, user.user_id);
    })

    passport.deserialUser((user_id, done) => {
        User.find({where: {id}})
            .then(user => done(null, user))
            .catch(err => done(err));
    })
}

local(passport);