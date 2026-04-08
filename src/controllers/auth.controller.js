const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/usuarioModel');

const authController = {

    register: async (req, res) => {
        try {
            const { nombre, apellido, correo, password, telefono, direccion } = req.body;

            const exists = await UsuarioModel.emailExists(correo);
            if (exists) {
                return res.status(400).json({ message: 'El correo ya está registrado' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await UsuarioModel.create({
                nombre, apellido, correo, password: hashedPassword, telefono, direccion
            });

            const token = jwt.sign(
                { id: user.id, correo: user.correo, rol: 'usuario' },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                user,
                token,
            });
        } catch (error) {
            console.error('Error en register:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    login: async (req, res) => {
        try {
            const { correo, password } = req.body;

            const user = await UsuarioModel.getByEmail(correo);
            if (!user) {
                return res.status(401).json({ message: 'Credenciales incorrectas' });
            }

            if (!user.activo) {
                return res.status(403).json({ message: 'Cuenta desactivada' });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ message: 'Credenciales incorrectas' });
            }

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
    },

    getProfile: async (req, res) => {
        try {
            const user = await UsuarioModel.getById(req.user.id);

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.json(user);
        } catch (error) {
            console.error('Error en getProfile:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

};

module.exports = authController;
