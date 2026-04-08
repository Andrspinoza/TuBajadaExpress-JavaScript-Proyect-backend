const pool = require('../config/db');

class RestauranteModel {
    static async getAll() {
        const { rows } = await pool.query(
            'SELECT * FROM restaurantes WHERE activo = true ORDER BY calificacion DESC'
        );
        return rows;
    }

    static async getById(id) {
        const { rows } = await pool.query('SELECT * FROM restaurantes WHERE id = $1', [id]);
        return rows[0];
    }

    static async create(data) {
        const { nombre, descripcion, direccion, telefono, correo, logo_url, imagen_portada_url, horario_apertura, horario_cierre } = data;
        const { rows } = await pool.query(
            `INSERT INTO restaurantes (nombre, descripcion, direccion, telefono, correo, logo_url, imagen_portada_url, horario_apertura, horario_cierre)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [nombre, descripcion, direccion, telefono, correo, logo_url, imagen_portada_url, horario_apertura, horario_cierre]
        );
        return rows[0];
    }

    static async update(id, data) {
        const { nombre, descripcion, direccion, telefono, correo, horario_apertura, horario_cierre, activo } = data;
        const { rows } = await pool.query(
            `UPDATE restaurantes SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion),
             direccion = COALESCE($3, direccion), telefono = COALESCE($4, telefono), correo = COALESCE($5, correo),
             horario_apertura = COALESCE($6, horario_apertura), horario_cierre = COALESCE($7, horario_cierre),
             activo = COALESCE($8, activo), updated_at = CURRENT_TIMESTAMP
             WHERE id = $9 RETURNING *`,
            [nombre, descripcion, direccion, telefono, correo, horario_apertura, horario_cierre, activo, id]
        );
        return rows[0];
    }

    static async delete(id) {
        const { rows } = await pool.query('DELETE FROM restaurantes WHERE id = $1 RETURNING id', [id]);
        return rows[0];
    }
}

module.exports = RestauranteModel;
