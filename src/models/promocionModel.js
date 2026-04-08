const pool = require('../config/db');

class PromocionModel {
    static async getActive() {
        const { rows } = await pool.query(
            `SELECT p.*, r.nombre AS restaurante, pl.nombre AS platillo
             FROM promociones p
             LEFT JOIN restaurantes r ON p.restaurante_id = r.id
             LEFT JOIN platillos pl ON p.platillo_id = pl.id
             WHERE p.activo = true AND p.fecha_inicio <= NOW() AND p.fecha_fin >= NOW()
             ORDER BY p.fecha_fin ASC`
        );
        return rows;
    }

    static async getAll() {
        const { rows } = await pool.query(
            `SELECT p.*, r.nombre AS restaurante, pl.nombre AS platillo
             FROM promociones p
             LEFT JOIN restaurantes r ON p.restaurante_id = r.id
             LEFT JOIN platillos pl ON p.platillo_id = pl.id
             ORDER BY p.created_at DESC`
        );
        return rows;
    }

    static async getById(id) {
        const { rows } = await pool.query(
            `SELECT * FROM promociones WHERE id = $1 AND activo = true AND fecha_inicio <= NOW() AND fecha_fin >= NOW()`,
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const { restaurante_id, platillo_id, titulo, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, codigo_promocion, imagen_url } = data;
        const { rows } = await pool.query(
            `INSERT INTO promociones (restaurante_id, platillo_id, titulo, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, codigo_promocion, imagen_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [restaurante_id || null, platillo_id || null, titulo, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, codigo_promocion || null, imagen_url]
        );
        return rows[0];
    }

    static async update(id, data) {
        const { titulo, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, codigo_promocion, activo } = data;
        const { rows } = await pool.query(
            `UPDATE promociones SET titulo = COALESCE($1, titulo), descripcion = COALESCE($2, descripcion),
             tipo_descuento = COALESCE($3, tipo_descuento), valor_descuento = COALESCE($4, valor_descuento),
             fecha_inicio = COALESCE($5, fecha_inicio), fecha_fin = COALESCE($6, fecha_fin),
             codigo_promocion = COALESCE($7, codigo_promocion), activo = COALESCE($8, activo)
             WHERE id = $9 RETURNING *`,
            [titulo, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, codigo_promocion, activo, id]
        );
        return rows[0];
    }

    static async delete(id) {
        const { rows } = await pool.query('DELETE FROM promociones WHERE id = $1 RETURNING id', [id]);
        return rows[0];
    }
}

module.exports = PromocionModel;
