import jwt from 'jsonwebtoken';

exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthoricated()) {
        next();
    } else {
        res.status(403).send({
            message: "isNotLoggedIn"
        });
    }
}

exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthoricated()){
        next();
    } else {
        res.redirect('/');
    }
}

exports.verifyToken = (req, res, next) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, (process.env.JWT_SECRET || 'xu5q!p1'));

    if(decoded) {
        next();
    } else {
        res.status(401).send({
            message: 'not verified'
        })
    }
}