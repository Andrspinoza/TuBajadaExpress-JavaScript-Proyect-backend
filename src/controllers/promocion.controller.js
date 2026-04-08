const pool = require('../config/db');

// Obtener promociones activas (público)
const getActive = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, r.nombre AS restaurante, pl.nombre AS platillo
             FROM promociones p
             LEFT JOIN restaurantes r ON p.restaurante_id = r.id
             LEFT JOIN platillos pl ON p.platillo_id = pl.id
             WHERE p.activo = true AND p.fecha_inicio <= NOW() AND p.fecha_fin >= NOW()
             ORDER BY p.fecha_fin ASC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error en getActive promociones:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener todas las promociones (admin)
const getAll = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, r.nombre AS restaurante, pl.nombre AS platillo
             FROM promociones p
             LEFT JOIN restaurantes r ON p.restaurante_id = r.id
             LEFT JOIN platillos pl ON p.platillo_id = pl.id
             ORDER BY p.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error en getAll promociones:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Crear promoción (admin)
const create = async (req, res) => {
    try {
        const { restaurante_id, platillo_id, titulo, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, codigo_promocion } = req.body;
        const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

        const result = await pool.query(
            `INSERT INTO promociones (restaurante_id, platillo_id, titulo, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, codigo_promocion, imagen_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [restaurante_id || null, platillo_id || null, titulo, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, codigo_promocion || null, imagen_url]
        );

        res.status(201).json({ message: 'Promoción creada', promocion: result.rows[0] });
    } catch (error) {
        console.error('Error en create promocion:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualizar promoción (admin)
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, codigo_promocion, activo } = req.body;

        const result = await pool.query(
            `UPDATE promociones SET titulo = COALESCE($1, titulo), descripcion = COALESCE($2, descripcion),
             tipo_descuento = COALESCE($3, tipo_descuento), valor_descuento = COALESCE($4, valor_descuento),
             fecha_inicio = COALESCE($5, fecha_inicio), fecha_fin = COALESCE($6, fecha_fin),
             codigo_promocion = COALESCE($7, codigo_promocion), activo = COALESCE($8, activo)
             WHERE id = $9 RETURNING *`,
            [titulo, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, codigo_promocion, activo, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Promoción no encontrada' });
        }

        res.json({ message: 'Promoción actualizada', promocion: result.rows[0] });
    } catch (error) {
        console.error('Error en update promocion:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Eliminar promoción (admin)
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM promociones WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Promoción no encontrada' });
        }

        res.json({ message: 'Promoción eliminada' });
    } catch (error) {
        console.error('Error en remove promocion:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { getActive, getAll, create, update, remove };
