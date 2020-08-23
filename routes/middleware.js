import jwt from 'jsonwebtoken';

// 로그인 상태인지 확인
exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthoricated()) {
        next();
    } else {
        res.status(403).send({
            message: "isNotLoggedIn"
        });
    }
}

// 로그인 안된 상태인지 확인
exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthoricated()){
        next();
    } else {
        res.redirect('/');
    }
}

// 클라이언트로부터 받은 jwt 검증
exports.verifyToken = (req, res, next) => {
    try {
        req.decoded = jwt.verify(req.headers.authorization, (process.env.JWT_SECRET || 'xu5q!p1'));
        return next();
    } catch (err) {
        if(err.name === 'TokenExpriedError') {
            return res.status(419).json({
                code: 419,
                message: 'expired token',
            })
        } 

        return res.status(401).json({
            code: 401,
            message: 'invalid token',
        })
    }
}
