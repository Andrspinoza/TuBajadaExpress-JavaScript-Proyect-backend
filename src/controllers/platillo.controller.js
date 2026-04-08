const PlatilloModel = require('../models/platilloModel');

const platilloController = {

    getAll: async (req, res) => {
        try {
            const { restaurante_id, categoria_id } = req.query;
            const platillos = await PlatilloModel.getAll({ restaurante_id, categoria_id });
            res.json(platillos);
        } catch (error) {
            console.error('Error en getAll platillos:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    getById: async (req, res) => {
        try {
            const platillo = await PlatilloModel.getById(req.params.id);

            if (!platillo) {
                return res.status(404).json({ message: 'Platillo no encontrado' });
            }

            res.json(platillo);
        } catch (error) {
            console.error('Error en getById platillo:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    create: async (req, res) => {
        try {
            const { restaurante_id, categoria_id, nombre, descripcion, precio, tiempo_preparacion } = req.body;
            const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

            const platillo = await PlatilloModel.create({
                restaurante_id, categoria_id, nombre, descripcion, precio, imagen_url, tiempo_preparacion
            });

            res.status(201).json({ message: 'Platillo creado', platillo });
        } catch (error) {
            console.error('Error en create platillo:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    update: async (req, res) => {
        try {
            const { restaurante_id, categoria_id, nombre, descripcion, precio, disponible, tiempo_preparacion } = req.body;
            const imagen_url = req.file ? `/uploads/${req.file.filename}` : undefined;

            const platillo = await PlatilloModel.update(req.params.id, {
                restaurante_id, categoria_id, nombre, descripcion, precio, disponible, tiempo_preparacion, imagen_url
            });

            if (!platillo) {
                return res.status(404).json({ message: 'Platillo no encontrado' });
            }

            res.json({ message: 'Platillo actualizado', platillo });
        } catch (error) {
            console.error('Error en update platillo:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    remove: async (req, res) => {
        try {
            const platillo = await PlatilloModel.delete(req.params.id);

            if (!platillo) {
                return res.status(404).json({ message: 'Platillo no encontrado' });
            }

            res.json({ message: 'Platillo eliminado' });
        } catch (error) {
            console.error('Error en remove platillo:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

};

module.exports = platilloController;
