const { Router } = require('express');
const { getAll, getById, create, update, remove } = require('../controllers/platillo.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Platillos
 *   description: Gestión de platillos
 */

/**
 * @swagger
 * /api/platillos:
 *   get:
 *     summary: Obtener todos los platillos disponibles
 *     tags: [Platillos]
 *     parameters:
 *       - in: query
 *         name: restaurante_id
 *         schema:
 *           type: integer
 *         description: Filtrar por restaurante
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *     responses:
 *       200:
 *         description: Lista de platillos
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/platillos/{id}:
 *   get:
 *     summary: Obtener un platillo por ID
 *     tags: [Platillos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Platillo encontrado
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/platillos:
 *   post:
 *     summary: Crear un platillo (admin)
 *     tags: [Platillos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [restaurante_id, categoria_id, nombre, precio]
 *             properties:
 *               restaurante_id:
 *                 type: integer
 *               categoria_id:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               tiempo_preparacion:
 *                 type: integer
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Platillo creado
 */
router.post('/', verifyToken, isAdmin, upload.single('imagen'), create);

/**
 * @swagger
 * /api/platillos/{id}:
 *   put:
 *     summary: Actualizar un platillo (admin)
 *     tags: [Platillos]
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
 *         description: Platillo actualizado
 */
router.put('/:id', verifyToken, isAdmin, upload.single('imagen'), update);

/**
 * @swagger
 * /api/platillos/{id}:
 *   delete:
 *     summary: Eliminar un platillo (admin)
 *     tags: [Platillos]
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
 *         description: Platillo eliminado
 */
router.delete('/:id', verifyToken, isAdmin, remove);

module.exports = router;
