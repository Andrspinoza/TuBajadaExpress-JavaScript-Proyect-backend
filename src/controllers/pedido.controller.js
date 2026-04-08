const PedidoModel = require('../models/pedidoModel');
const PlatilloModel = require('../models/platilloModel');
const PromocionModel = require('../models/promocionModel');

const pedidoController = {

    create: async (req, res) => {
        const client = await PedidoModel.getClient();
        try {
            await client.query('BEGIN');

            const { restaurante_id, promocion_id, direccion_entrega, notas, metodo_pago, items } = req.body;
            const usuario_id = req.user.id;

            if (!items || items.length === 0) {
                return res.status(400).json({ message: 'Debe incluir al menos un platillo' });
            }

            // Calcular subtotal consultando precios reales
            let subtotal = 0;
            const detalles = [];

            for (const item of items) {
                const platillo = await PlatilloModel.getByIdSimple(item.platillo_id);
                if (!platillo) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ message: `Platillo con ID ${item.platillo_id} no disponible` });
                }

                const precio_unitario = parseFloat(platillo.precio);
                const cantidad = item.cantidad || 1;
                const item_subtotal = precio_unitario * cantidad;
                subtotal += item_subtotal;

                detalles.push({
                    platillo_id: item.platillo_id,
                    cantidad,
                    precio_unitario,
                    subtotal: item_subtotal,
                    notas: item.notas || null,
                });
            }

            // Calcular descuento si hay promoción
            let descuento = 0;
            if (promocion_id) {
                const promo = await PromocionModel.getById(promocion_id);
                if (promo) {
                    if (promo.tipo_descuento === 'porcentaje') {
                        descuento = subtotal * (parseFloat(promo.valor_descuento) / 100);
                    } else {
                        descuento = parseFloat(promo.valor_descuento);
                    }
                }
            }

            const total = Math.max(subtotal - descuento, 0);

            // Insertar pedido
            const pedido = await PedidoModel.create({
                usuario_id, restaurante_id, promocion_id, subtotal, descuento, total, direccion_entrega, notas, metodo_pago
            }, client);

            // Insertar detalles
            for (const detalle of detalles) {
                await PedidoModel.createDetail({ pedido_id: pedido.id, ...detalle }, client);
            }

            await client.query('COMMIT');

            res.status(201).json({ message: 'Pedido creado exitosamente', pedido, detalles });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error en create pedido:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        } finally {
            client.release();
        }
    },

    getMyOrders: async (req, res) => {
        try {
            const pedidos = await PedidoModel.getByUserId(req.user.id);
            res.json(pedidos);
        } catch (error) {
            console.error('Error en getMyOrders:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    getOrderDetail: async (req, res) => {
        try {
            const pedido = await PedidoModel.getById(req.params.id);

            if (!pedido) {
                return res.status(404).json({ message: 'Pedido no encontrado' });
            }

            if (pedido.usuario_id !== req.user.id && req.user.rol !== 'admin') {
                return res.status(403).json({ message: 'No tienes permiso para ver este pedido' });
            }

            const detalles = await PedidoModel.getDetailsByPedidoId(req.params.id);

            res.json({ pedido, detalles });
        } catch (error) {
            console.error('Error en getOrderDetail:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    getAll: async (req, res) => {
        try {
            const pedidos = await PedidoModel.getAll(req.query.estado);
            res.json(pedidos);
        } catch (error) {
            console.error('Error en getAll pedidos:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { estado } = req.body;

            const validStates = ['pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado', 'cancelado'];
            if (!validStates.includes(estado)) {
                return res.status(400).json({ message: `Estado inválido. Estados válidos: ${validStates.join(', ')}` });
            }

            const pedido = await PedidoModel.updateStatus(req.params.id, estado);

            if (!pedido) {
                return res.status(404).json({ message: 'Pedido no encontrado' });
            }

            res.json({ message: 'Estado actualizado', pedido });
        } catch (error) {
            console.error('Error en updateStatus pedido:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

};

module.exports = pedidoController;
