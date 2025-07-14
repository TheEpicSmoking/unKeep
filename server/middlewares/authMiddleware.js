import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => { 
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing token' });
        }
        const token = authorizationHeader.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('Token verification error:', err.name)

                if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' })
                }
                if (err.name === 'JsonWebTokenError') {
                    return res.status(401).json({ error: 'Invalid token' })
                }
                console.error('Token verification error:', err);
                return res.status(403).json({ error: 'Forbidden' });
            }
            req.userId = decoded.id;
            next();
        });
    } catch (error) {
        console.error('Error in verifyToken middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }  
};