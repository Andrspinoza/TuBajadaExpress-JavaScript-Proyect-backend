const pool = require('../config/db');

// Crear pedido con detalles (usuario autenticado)
const create = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { restaurante_id, promocion_id, direccion_entrega, notas, metodo_pago, items } = req.body;
        const usuario_id = req.user.id;

        // items = [{ platillo_id, cantidad, notas }]
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Debe incluir al menos un platillo' });
        }

        // Calcular subtotal consultando precios reales
        let subtotal = 0;
        const detalles = [];

        for (const item of items) {
            const platillo = await client.query('SELECT precio, nombre FROM platillos WHERE id = $1 AND disponible = true', [item.platillo_id]);
            if (platillo.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Platillo con ID ${item.platillo_id} no disponible` });
            }

            const precio_unitario = parseFloat(platillo.rows[0].precio);
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
            const promo = await client.query(
                `SELECT * FROM promociones WHERE id = $1 AND activo = true AND fecha_inicio <= NOW() AND fecha_fin >= NOW()`,
                [promocion_id]
            );

            if (promo.rows.length > 0) {
                const p = promo.rows[0];
                if (p.tipo_descuento === 'porcentaje') {
                    descuento = subtotal * (parseFloat(p.valor_descuento) / 100);
                } else {
                    descuento = parseFloat(p.valor_descuento);
                }
            }
        }

        const total = Math.max(subtotal - descuento, 0);

        // Insertar pedido
        const pedidoResult = await client.query(
            `INSERT INTO pedidos (usuario_id, restaurante_id, promocion_id, subtotal, descuento, total, direccion_entrega, notas, metodo_pago)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [usuario_id, restaurante_id, promocion_id || null, subtotal, descuento, total, direccion_entrega, notas || null, metodo_pago || 'efectivo']
        );

        const pedido = pedidoResult.rows[0];

        // Insertar detalles del pedido
        for (const detalle of detalles) {
            await client.query(
                `INSERT INTO detalle_pedidos (pedido_id, platillo_id, cantidad, precio_unitario, subtotal, notas)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [pedido.id, detalle.platillo_id, detalle.cantidad, detalle.precio_unitario, detalle.subtotal, detalle.notas]
            );
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
};

// Obtener pedidos del usuario autenticado
const getMyOrders = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, r.nombre AS restaurante
             FROM pedidos p
             JOIN restaurantes r ON p.restaurante_id = r.id
             WHERE p.usuario_id = $1
             ORDER BY p.fecha_pedido DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error en getMyOrders:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener detalle de un pedido
const getOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el pedido pertenezca al usuario (o sea admin)
        const pedido = await pool.query(
            `SELECT p.*, r.nombre AS restaurante
             FROM pedidos p
             JOIN restaurantes r ON p.restaurante_id = r.id
             WHERE p.id = $1`,
            [id]
        );

        if (pedido.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        if (pedido.rows[0].usuario_id !== req.user.id && req.user.rol !== 'admin') {
            return res.status(403).json({ message: 'No tienes permiso para ver este pedido' });
        }

        // Obtener detalles
        const detalles = await pool.query(
            `SELECT d.*, pl.nombre AS platillo, pl.imagen_url
             FROM detalle_pedidos d
             JOIN platillos pl ON d.platillo_id = pl.id
             WHERE d.pedido_id = $1`,
            [id]
        );

        res.json({ pedido: pedido.rows[0], detalles: detalles.rows });
    } catch (error) {
        console.error('Error en getOrderDetail:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener todos los pedidos (admin)
const getAll = async (req, res) => {
    try {
        const { estado } = req.query;
        let query = `SELECT p.*, r.nombre AS restaurante, u.nombre AS usuario_nombre, u.correo AS usuario_correo
                      FROM pedidos p
                      JOIN restaurantes r ON p.restaurante_id = r.id
                      JOIN usuarios u ON p.usuario_id = u.id`;
        const params = [];

        if (estado) {
            params.push(estado);
            query += ` WHERE p.estado = $${params.length}`;
        }

        query += ' ORDER BY p.fecha_pedido DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error en getAll pedidos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualizar estado de pedido (admin)
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const validStates = ['pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado', 'cancelado'];
        if (!validStates.includes(estado)) {
            return res.status(400).json({ message: `Estado inválido. Estados válidos: ${validStates.join(', ')}` });
        }

        const result = await pool.query(
            `UPDATE pedidos SET estado = $1, updated_at = CURRENT_TIMESTAMP,
             fecha_entrega = CASE WHEN $1 = 'entregado' THEN CURRENT_TIMESTAMP ELSE fecha_entrega END
             WHERE id = $2 RETURNING *`,
            [estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.json({ message: 'Estado actualizado', pedido: result.rows[0] });
    } catch (error) {
        console.error('Error en updateStatus pedido:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { create, getMyOrders, getOrderDetail, getAll, updateStatus };
