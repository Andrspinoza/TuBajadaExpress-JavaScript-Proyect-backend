const { Router } = require('express');
const { getAll, getById, create, update, remove } = require('../controllers/restaurante.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Restaurantes
 *   description: Gestión de restaurantes
 */

/**
 * @swagger
 * /api/restaurantes:
 *   get:
 *     summary: Obtener todos los restaurantes activos
 *     tags: [Restaurantes]
 *     responses:
 *       200:
 *         description: Lista de restaurantes
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/restaurantes/{id}:
 *   get:
 *     summary: Obtener un restaurante por ID
 *     tags: [Restaurantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Restaurante encontrado
 *       404:
 *         description: Restaurante no encontrado
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/restaurantes:
 *   post:
 *     summary: Crear un restaurante (admin)
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [nombre, direccion]
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               direccion:
 *                 type: string
 *               telefono:
 *                 type: string
 *               correo:
 *                 type: string
 *               horario_apertura:
 *                 type: string
 *               horario_cierre:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *               portada:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Restaurante creado
 */
router.post('/', verifyToken, isAdmin, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'portada', maxCount: 1 }]), create);

/**
 * @swagger
 * /api/restaurantes/{id}:
 *   put:
 *     summary: Actualizar un restaurante (admin)
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Restaurante actualizado
 */
router.put('/:id', verifyToken, isAdmin, update);

/**
 * @swagger
 * /api/restaurantes/{id}:
 *   delete:
 *     summary: Eliminar un restaurante (admin)
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Restaurante eliminado
 */
router.delete('/:id', verifyToken, isAdmin, remove);

module.exports = router;
