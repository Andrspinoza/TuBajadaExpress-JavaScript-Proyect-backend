const pool = require('../config/db');

// Obtener todas las categorías (público)
const getAll = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias WHERE activo = true ORDER BY nombre');
        res.json(result.rows);
    } catch (error) {
        console.error('Error en getAll categorias:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Crear categoría (admin)
const create = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

        const result = await pool.query(
            'INSERT INTO categorias (nombre, descripcion, imagen_url) VALUES ($1, $2, $3) RETURNING *',
            [nombre, descripcion, imagen_url]
        );

        res.status(201).json({ message: 'Categoría creada', categoria: result.rows[0] });
    } catch (error) {
        console.error('Error en create categoria:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualizar categoría (admin)
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, activo } = req.body;

        const result = await pool.query(
            `UPDATE categorias SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion),
             activo = COALESCE($3, activo) WHERE id = $4 RETURNING *`,
            [nombre, descripcion, activo, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        res.json({ message: 'Categoría actualizada', categoria: result.rows[0] });
    } catch (error) {
        console.error('Error en update categoria:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Eliminar categoría (admin)
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        res.json({ message: 'Categoría eliminada' });
    } catch (error) {
        console.error('Error en remove categoria:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { getAll, create, update, remove };
