const CategoriaModel = require('../models/categoriaModel');

const categoriaController = {

    getAll: async (req, res) => {
        try {
            const categorias = await CategoriaModel.getAll();
            res.json(categorias);
        } catch (error) {
            console.error('Error en getAll categorias:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    create: async (req, res) => {
        try {
            const { nombre, descripcion } = req.body;
            const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

            const categoria = await CategoriaModel.create({ nombre, descripcion, imagen_url });

            res.status(201).json({ message: 'Categoría creada', categoria });
        } catch (error) {
            console.error('Error en create categoria:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    update: async (req, res) => {
        try {
            const categoria = await CategoriaModel.update(req.params.id, req.body);

            if (!categoria) {
                return res.status(404).json({ message: 'Categoría no encontrada' });
            }

            res.json({ message: 'Categoría actualizada', categoria });
        } catch (error) {
            console.error('Error en update categoria:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    remove: async (req, res) => {
        try {
            const categoria = await CategoriaModel.delete(req.params.id);

            if (!categoria) {
                return res.status(404).json({ message: 'Categoría no encontrada' });
            }

            res.json({ message: 'Categoría eliminada' });
        } catch (error) {
            console.error('Error en remove categoria:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

};

module.exports = categoriaController;
