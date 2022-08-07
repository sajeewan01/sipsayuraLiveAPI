const jwt = require('express-jwt');
const JWT = require('jsonwebtoken')
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = {
    authorize,
    verifyAccessToken
};

function authorize(roles = []) {
    // roles param can be a single role string (e.g. Role.User or 'User') 
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach user to request object (req.user)
        jwt({ secret, algorithms: ['HS256'] }),

        // authorize based on user role
        async (req, res, next) => {
            const account = await db.Account.findByPk(req.user.id);

            if (!account || (roles.length && !roles.includes(account.role))) {
                // account no longer exists or role not authorized
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // authentication and authorization successful
            req.user.role = account.role;
            const refreshTokens = await account.getRefreshTokens();
            req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
            next();
        }
    ];
}

function verifyAccessToken(req, res, next) {
    if (!req.headers['authorization']) return res.status(401).json({ message: "Unauthorized!" })
    const authHeader = req.headers['authorization']
    const bearerToken = authHeader.split(' ')
    const token = bearerToken[1]
    // JWT.verify(token, secret, (err, payload) => {
    //     if(err){
    //         return res.json({'message':'Error 2'})
    //     }
    //     req.payload = payload
    //     next()
    // })

    JWT.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        req.userId = decoded.id;
        next();
    })
}