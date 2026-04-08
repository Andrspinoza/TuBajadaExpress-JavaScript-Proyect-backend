const pool = require('../config/db');

class PlatilloModel {
    static async getAll(filters = {}) {
        let query = `SELECT p.*, r.nombre AS restaurante, c.nombre AS categoria
                      FROM platillos p
                      JOIN restaurantes r ON p.restaurante_id = r.id
                      JOIN categorias c ON p.categoria_id = c.id
                      WHERE p.disponible = true`;
        const params = [];

        if (filters.restaurante_id) {
            params.push(filters.restaurante_id);
            query += ` AND p.restaurante_id = $${params.length}`;
        }

        if (filters.categoria_id) {
            params.push(filters.categoria_id);
            query += ` AND p.categoria_id = $${params.length}`;
        }

        query += ' ORDER BY p.created_at DESC';

        const { rows } = await pool.query(query, params);
        return rows;
    }

    static async getById(id) {
        const { rows } = await pool.query(
            `SELECT p.*, r.nombre AS restaurante, c.nombre AS categoria
             FROM platillos p
             JOIN restaurantes r ON p.restaurante_id = r.id
             JOIN categorias c ON p.categoria_id = c.id
             WHERE p.id = $1`,
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const { restaurante_id, categoria_id, nombre, descripcion, precio, imagen_url, tiempo_preparacion } = data;
        const { rows } = await pool.query(
            `INSERT INTO platillos (restaurante_id, categoria_id, nombre, descripcion, precio, imagen_url, tiempo_preparacion)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [restaurante_id, categoria_id, nombre, descripcion, precio, imagen_url, tiempo_preparacion]
        );
        return rows[0];
    }

    static async update(id, data) {
        const { restaurante_id, categoria_id, nombre, descripcion, precio, disponible, tiempo_preparacion, imagen_url } = data;
        const { rows } = await pool.query(
            `UPDATE platillos SET
             restaurante_id = COALESCE($1, restaurante_id), categoria_id = COALESCE($2, categoria_id),
             nombre = COALESCE($3, nombre), descripcion = COALESCE($4, descripcion),
             precio = COALESCE($5, precio), disponible = COALESCE($6, disponible),
             tiempo_preparacion = COALESCE($7, tiempo_preparacion),
             imagen_url = COALESCE($8, imagen_url), updated_at = CURRENT_TIMESTAMP
             WHERE id = $9 RETURNING *`,
            [restaurante_id, categoria_id, nombre, descripcion, precio, disponible, tiempo_preparacion, imagen_url, id]
        );
        return rows[0];
    }

    static async delete(id) {
        const { rows } = await pool.query('DELETE FROM platillos WHERE id = $1 RETURNING id', [id]);
        return rows[0];
    }

    static async getByIdSimple(id) {
        const { rows } = await pool.query('SELECT precio, nombre FROM platillos WHERE id = $1 AND disponible = true', [id]);
        return rows[0];
    }
}

module.exports = PlatilloModel;
