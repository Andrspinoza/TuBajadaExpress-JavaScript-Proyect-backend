const { Router } = require('express');
const { create, getMyOrders, getOrderDetail, getAll, updateStatus } = require('../controllers/pedido.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Gestión de pedidos de comida
 */

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Crear un nuevo pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [restaurante_id, direccion_entrega, items]
 *             properties:
 *               restaurante_id:
 *                 type: integer
 *               promocion_id:
 *                 type: integer
 *               direccion_entrega:
 *                 type: string
 *               notas:
 *                 type: string
 *               metodo_pago:
 *                 type: string
 *                 enum: [efectivo, tarjeta, transferencia]
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [platillo_id, cantidad]
 *                   properties:
 *                     platillo_id:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *                     notas:
 *                       type: string
 *     responses:
 *       201:
 *         description: Pedido creado exitosamente
 */
router.post('/', verifyToken, create);

/**
 * @swagger
 * /api/pedidos/mis-pedidos:
 *   get:
 *     summary: Obtener los pedidos del usuario autenticado
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos del usuario
 */
router.get('/mis-pedidos', verifyToken, getMyOrders);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   get:
 *     summary: Obtener detalle de un pedido
 *     tags: [Pedidos]
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
 *         description: Detalle del pedido con items
 */
router.get('/:id', verifyToken, getOrderDetail);

/**
 * @swagger
 * /api/pedidos/admin/todos:
 *   get:
 *     summary: Obtener todos los pedidos (admin)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, confirmado, preparando, en_camino, entregado, cancelado]
 *     responses:
 *       200:
 *         description: Lista de todos los pedidos
 */
router.get('/admin/todos', verifyToken, isAdmin, getAll);

/**
 * @swagger
 * /api/pedidos/{id}/estado:
 *   patch:
 *     summary: Actualizar estado de un pedido (admin)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, confirmado, preparando, en_camino, entregado, cancelado]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/:id/estado', verifyToken, isAdmin, updateStatus);

module.exports = router;
