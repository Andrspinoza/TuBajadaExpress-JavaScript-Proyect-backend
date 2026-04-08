const pool = require('../config/db');

class CategoriaModel {
    static async getAll() {
        const { rows } = await pool.query('SELECT * FROM categorias WHERE activo = true ORDER BY nombre');
        return rows;
    }

    static async create(data) {
        const { nombre, descripcion, imagen_url } = data;
        const { rows } = await pool.query(
            'INSERT INTO categorias (nombre, descripcion, imagen_url) VALUES ($1, $2, $3) RETURNING *',
            [nombre, descripcion, imagen_url]
        );
        return rows[0];
    }

    static async update(id, data) {
        const { nombre, descripcion, activo } = data;
        const { rows } = await pool.query(
            `UPDATE categorias SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion),
             activo = COALESCE($3, activo) WHERE id = $4 RETURNING *`,
            [nombre, descripcion, activo, id]
        );
        return rows[0];
    }

    static async delete(id) {
        const { rows } = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING id', [id]);
        return rows[0];
    }
}

module.exports = CategoriaModel;
