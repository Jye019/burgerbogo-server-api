import jwt from 'jsonwebtoken';

exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthoricated()) {
        next();
    } else {
        req.status(403).send('로그인 필요');
    }
}

exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthoricated()){
        next();
    } else {
        res.redirect('/');
    }
}

exports.verify = () => {
    
}