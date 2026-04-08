const PromocionModel = require('../models/promocionModel');

const promocionController = {

    getActive: async (req, res) => {
        try {
            const promociones = await PromocionModel.getActive();
            res.json(promociones);
        } catch (error) {
            console.error('Error en getActive promociones:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    getAll: async (req, res) => {
        try {
            const promociones = await PromocionModel.getAll();
            res.json(promociones);
        } catch (error) {
            console.error('Error en getAll promociones:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    create: async (req, res) => {
        try {
            const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

            const promocion = await PromocionModel.create({ ...req.body, imagen_url });

            res.status(201).json({ message: 'Promoción creada', promocion });
        } catch (error) {
            console.error('Error en create promocion:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    update: async (req, res) => {
        try {
            const promocion = await PromocionModel.update(req.params.id, req.body);

            if (!promocion) {
                return res.status(404).json({ message: 'Promoción no encontrada' });
            }

            res.json({ message: 'Promoción actualizada', promocion });
        } catch (error) {
            console.error('Error en update promocion:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    remove: async (req, res) => {
        try {
            const promocion = await PromocionModel.delete(req.params.id);

            if (!promocion) {
                return res.status(404).json({ message: 'Promoción no encontrada' });
            }

            res.json({ message: 'Promoción eliminada' });
        } catch (error) {
            console.error('Error en remove promocion:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

};

module.exports = promocionController;
