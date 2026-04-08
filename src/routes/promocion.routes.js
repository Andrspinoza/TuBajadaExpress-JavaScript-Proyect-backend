const { Router } = require('express');
const { getActive, getAll, create, update, remove } = require('../controllers/promocion.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Promociones
 *   description: Gestión de promociones por tiempo limitado
 */

/**
 * @swagger
 * /api/promociones/activas:
 *   get:
 *     summary: Obtener promociones activas vigentes
 *     tags: [Promociones]
 *     responses:
 *       200:
 *         description: Lista de promociones vigentes
 */
router.get('/activas', getActive);

/**
 * @swagger
 * /api/promociones:
 *   get:
 *     summary: Obtener todas las promociones (admin)
 *     tags: [Promociones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las promociones
 */
router.get('/', verifyToken, isAdmin, getAll);

/**
 * @swagger
 * /api/promociones:
 *   post:
 *     summary: Crear una promoción (admin)
 *     tags: [Promociones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [titulo, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin]
 *             properties:
 *               restaurante_id:
 *                 type: integer
 *               platillo_id:
 *                 type: integer
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               tipo_descuento:
 *                 type: string
 *                 enum: [porcentaje, monto_fijo]
 *               valor_descuento:
 *                 type: number
 *               fecha_inicio:
 *                 type: string
 *                 format: date-time
 *               fecha_fin:
 *                 type: string
 *                 format: date-time
 *               codigo_promocion:
 *                 type: string
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Promoción creada
 */
router.post('/', verifyToken, isAdmin, upload.single('imagen'), create);

/**
 * @swagger
 * /api/promociones/{id}:
 *   put:
 *     summary: Actualizar una promoción (admin)
 *     tags: [Promociones]
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
 *         description: Promoción actualizada
 */
router.put('/:id', verifyToken, isAdmin, update);

/**
 * @swagger
 * /api/promociones/{id}:
 *   delete:
 *     summary: Eliminar una promoción (admin)
 *     tags: [Promociones]
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
 *         description: Promoción eliminada
 */
router.delete('/:id', verifyToken, isAdmin, remove);

module.exports = router;
