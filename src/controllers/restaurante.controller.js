const pool = require('../config/db');

// Obtener todos los restaurantes (público)
const getAll = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM restaurantes WHERE activo = true ORDER BY calificacion DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error en getAll restaurantes:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener un restaurante por ID (público)
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM restaurantes WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Restaurante no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error en getById restaurante:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Crear restaurante (admin)
const create = async (req, res) => {
    try {
        const { nombre, descripcion, direccion, telefono, correo, horario_apertura, horario_cierre } = req.body;

        const logo_url = req.files?.logo ? `/uploads/${req.files.logo[0].filename}` : null;
        const imagen_portada_url = req.files?.portada ? `/uploads/${req.files.portada[0].filename}` : null;

        const result = await pool.query(
            `INSERT INTO restaurantes (nombre, descripcion, direccion, telefono, correo, logo_url, imagen_portada_url, horario_apertura, horario_cierre)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [nombre, descripcion, direccion, telefono, correo, logo_url, imagen_portada_url, horario_apertura, horario_cierre]
        );

        res.status(201).json({ message: 'Restaurante creado', restaurante: result.rows[0] });
    } catch (error) {
        console.error('Error en create restaurante:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualizar restaurante (admin)
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, direccion, telefono, correo, horario_apertura, horario_cierre, activo } = req.body;

        const result = await pool.query(
            `UPDATE restaurantes SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion),
             direccion = COALESCE($3, direccion), telefono = COALESCE($4, telefono), correo = COALESCE($5, correo),
             horario_apertura = COALESCE($6, horario_apertura), horario_cierre = COALESCE($7, horario_cierre),
             activo = COALESCE($8, activo), updated_at = CURRENT_TIMESTAMP
             WHERE id = $9 RETURNING *`,
            [nombre, descripcion, direccion, telefono, correo, horario_apertura, horario_cierre, activo, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Restaurante no encontrado' });
        }

        res.json({ message: 'Restaurante actualizado', restaurante: result.rows[0] });
    } catch (error) {
        console.error('Error en update restaurante:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Eliminar restaurante (admin)
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM restaurantes WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Restaurante no encontrado' });
        }

        res.json({ message: 'Restaurante eliminado' });
    } catch (error) {
        console.error('Error en remove restaurante:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { getAll, getById, create, update, remove };
