const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar usuario
const register = async (req, res) => {
    try {
        const { nombre, apellido, correo, password, telefono, direccion } = req.body;

        // Verificar si el correo ya existe
        const existingUser = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear usuario (rol_id = 1 = usuario por defecto)
        const result = await pool.query(
            `INSERT INTO usuarios (nombre, apellido, correo, password, telefono, direccion)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, apellido, correo`,
            [nombre, apellido, correo, hashedPassword, telefono || null, direccion || null]
        );

        const user = result.rows[0];

        // Generar token
        const token = jwt.sign(
            { id: user.id, correo: user.correo, rol: 'usuario' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: { id: user.id, nombre: user.nombre, apellido: user.apellido, correo: user.correo },
            token,
        });
    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Iniciar sesión
const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        // Buscar usuario con su rol
        const result = await pool.query(
            `SELECT u.id, u.nombre, u.apellido, u.correo, u.password, u.activo, r.nombre AS rol
             FROM usuarios u
             JOIN roles r ON u.rol_id = r.id
             WHERE u.correo = $1`,
            [correo]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const user = result.rows[0];

        if (!user.activo) {
            return res.status(403).json({ message: 'Cuenta desactivada' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Generar token
        const token = jwt.sign(
            { id: user.id, correo: user.correo, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Inicio de sesión exitoso',
            user: { id: user.id, nombre: user.nombre, apellido: user.apellido, correo: user.correo, rol: user.rol },
            token,
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.nombre, u.apellido, u.correo, u.telefono, u.direccion, u.imagen_perfil, r.nombre AS rol, u.created_at
             FROM usuarios u
             JOIN roles r ON u.rol_id = r.id
             WHERE u.id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error en getProfile:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { register, login, getProfile };
