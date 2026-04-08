const pool = require('../config/db');

class UsuarioModel {
    static async getByEmail(correo) {
        const { rows } = await pool.query(
            `SELECT u.id, u.nombre, u.apellido, u.correo, u.password, u.activo, r.nombre AS rol
             FROM usuarios u
             JOIN roles r ON u.rol_id = r.id
             WHERE u.correo = $1`,
            [correo]
        );
        return rows[0];
    }

    static async getById(id) {
        const { rows } = await pool.query(
            `SELECT u.id, u.nombre, u.apellido, u.correo, u.telefono, u.direccion, u.imagen_perfil, r.nombre AS rol, u.created_at
             FROM usuarios u
             JOIN roles r ON u.rol_id = r.id
             WHERE u.id = $1`,
            [id]
        );
        return rows[0];
    }

    static async emailExists(correo) {
        const { rows } = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo]);
        return rows.length > 0;
    }

    static async create(userData) {
        const { nombre, apellido, correo, password, telefono, direccion } = userData;
        const { rows } = await pool.query(
            `INSERT INTO usuarios (nombre, apellido, correo, password, telefono, direccion)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, apellido, correo`,
            [nombre, apellido, correo, password, telefono || null, direccion || null]
        );
        return rows[0];
    }
}

module.exports = UsuarioModel;
