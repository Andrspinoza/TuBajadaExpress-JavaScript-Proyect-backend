const jwt = require('jsonwebtoken');

// Verificar que el usuario esté autenticado
const verifyToken = (req, res, next) => {
    const header = req.headers['authorization'];

    if (!header) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = header.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Formato de token inválido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

// Verificar que el usuario sea administrador
const isAdmin = (req, res, next) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };
