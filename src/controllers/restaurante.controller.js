const RestauranteModel = require('../models/restauranteModel');

const restauranteController = {

    getAll: async (req, res) => {
        try {
            const restaurantes = await RestauranteModel.getAll();
            res.json(restaurantes);
        } catch (error) {
            console.error('Error en getAll restaurantes:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    getById: async (req, res) => {
        try {
            const restaurante = await RestauranteModel.getById(req.params.id);

            if (!restaurante) {
                return res.status(404).json({ message: 'Restaurante no encontrado' });
            }

            res.json(restaurante);
        } catch (error) {
            console.error('Error en getById restaurante:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    create: async (req, res) => {
        try {
            const { nombre, descripcion, direccion, telefono, correo, horario_apertura, horario_cierre } = req.body;

            const logo_url = req.files?.logo ? `/uploads/${req.files.logo[0].filename}` : null;
            const imagen_portada_url = req.files?.portada ? `/uploads/${req.files.portada[0].filename}` : null;

            const restaurante = await RestauranteModel.create({
                nombre, descripcion, direccion, telefono, correo, logo_url, imagen_portada_url, horario_apertura, horario_cierre
            });

            res.status(201).json({ message: 'Restaurante creado', restaurante });
        } catch (error) {
            console.error('Error en create restaurante:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    update: async (req, res) => {
        try {
            const restaurante = await RestauranteModel.update(req.params.id, req.body);

            if (!restaurante) {
                return res.status(404).json({ message: 'Restaurante no encontrado' });
            }

            res.json({ message: 'Restaurante actualizado', restaurante });
        } catch (error) {
            console.error('Error en update restaurante:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    remove: async (req, res) => {
        try {
            const restaurante = await RestauranteModel.delete(req.params.id);

            if (!restaurante) {
                return res.status(404).json({ message: 'Restaurante no encontrado' });
            }

            res.json({ message: 'Restaurante eliminado' });
        } catch (error) {
            console.error('Error en remove restaurante:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

};

module.exports = restauranteController;
