const pool = require('../config/db');

// Obtener todos los platillos (público, con filtros opcionales)
const getAll = async (req, res) => {
    try {
        const { restaurante_id, categoria_id } = req.query;
        let query = `SELECT p.*, r.nombre AS restaurante, c.nombre AS categoria
                      FROM platillos p
                      JOIN restaurantes r ON p.restaurante_id = r.id
                      JOIN categorias c ON p.categoria_id = c.id
                      WHERE p.disponible = true`;
        const params = [];

        if (restaurante_id) {
            params.push(restaurante_id);
            query += ` AND p.restaurante_id = $${params.length}`;
        }

        if (categoria_id) {
            params.push(categoria_id);
            query += ` AND p.categoria_id = $${params.length}`;
        }

        query += ' ORDER BY p.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error en getAll platillos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener un platillo por ID (público)
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT p.*, r.nombre AS restaurante, c.nombre AS categoria
             FROM platillos p
             JOIN restaurantes r ON p.restaurante_id = r.id
             JOIN categorias c ON p.categoria_id = c.id
             WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Platillo no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error en getById platillo:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Crear platillo (admin)
const create = async (req, res) => {
    try {
        const { restaurante_id, categoria_id, nombre, descripcion, precio, tiempo_preparacion } = req.body;
        const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

        const result = await pool.query(
            `INSERT INTO platillos (restaurante_id, categoria_id, nombre, descripcion, precio, imagen_url, tiempo_preparacion)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [restaurante_id, categoria_id, nombre, descripcion, precio, imagen_url, tiempo_preparacion]
        );

        res.status(201).json({ message: 'Platillo creado', platillo: result.rows[0] });
    } catch (error) {
        console.error('Error en create platillo:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualizar platillo (admin)
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { restaurante_id, categoria_id, nombre, descripcion, precio, disponible, tiempo_preparacion } = req.body;

        let imagen_url = undefined;
        if (req.file) {
            imagen_url = `/uploads/${req.file.filename}`;
        }

        const result = await pool.query(
            `UPDATE platillos SET
             restaurante_id = COALESCE($1, restaurante_id), categoria_id = COALESCE($2, categoria_id),
             nombre = COALESCE($3, nombre), descripcion = COALESCE($4, descripcion),
             precio = COALESCE($5, precio), disponible = COALESCE($6, disponible),
             tiempo_preparacion = COALESCE($7, tiempo_preparacion),
             imagen_url = COALESCE($8, imagen_url), updated_at = CURRENT_TIMESTAMP
             WHERE id = $9 RETURNING *`,
            [restaurante_id, categoria_id, nombre, descripcion, precio, disponible, tiempo_preparacion, imagen_url, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Platillo no encontrado' });
        }

        res.json({ message: 'Platillo actualizado', platillo: result.rows[0] });
    } catch (error) {
        console.error('Error en update platillo:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Eliminar platillo (admin)
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM platillos WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Platillo no encontrado' });
        }

        res.json({ message: 'Platillo eliminado' });
    } catch (error) {
        console.error('Error en remove platillo:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { getAll, getById, create, update, remove };
