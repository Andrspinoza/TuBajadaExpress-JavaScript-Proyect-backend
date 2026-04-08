const pool = require('../config/db');

class PedidoModel {
    static async create(data, client) {
        const { usuario_id, restaurante_id, promocion_id, subtotal, descuento, total, direccion_entrega, notas, metodo_pago } = data;
        const { rows } = await client.query(
            `INSERT INTO pedidos (usuario_id, restaurante_id, promocion_id, subtotal, descuento, total, direccion_entrega, notas, metodo_pago)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [usuario_id, restaurante_id, promocion_id || null, subtotal, descuento, total, direccion_entrega, notas || null, metodo_pago || 'efectivo']
        );
        return rows[0];
    }

    static async createDetail(data, client) {
        const { pedido_id, platillo_id, cantidad, precio_unitario, subtotal, notas } = data;
        await client.query(
            `INSERT INTO detalle_pedidos (pedido_id, platillo_id, cantidad, precio_unitario, subtotal, notas)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [pedido_id, platillo_id, cantidad, precio_unitario, subtotal, notas]
        );
    }

    static async getByUserId(usuario_id) {
        const { rows } = await pool.query(
            `SELECT p.*, r.nombre AS restaurante
             FROM pedidos p
             JOIN restaurantes r ON p.restaurante_id = r.id
             WHERE p.usuario_id = $1
             ORDER BY p.fecha_pedido DESC`,
            [usuario_id]
        );
        return rows;
    }

    static async getById(id) {
        const { rows } = await pool.query(
            `SELECT p.*, r.nombre AS restaurante
             FROM pedidos p
             JOIN restaurantes r ON p.restaurante_id = r.id
             WHERE p.id = $1`,
            [id]
        );
        return rows[0];
    }

    static async getDetailsByPedidoId(pedido_id) {
        const { rows } = await pool.query(
            `SELECT d.*, pl.nombre AS platillo, pl.imagen_url
             FROM detalle_pedidos d
             JOIN platillos pl ON d.platillo_id = pl.id
             WHERE d.pedido_id = $1`,
            [pedido_id]
        );
        return rows;
    }

    static async getAll(estado) {
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

        const { rows } = await pool.query(query, params);
        return rows;
    }

    static async updateStatus(id, estado) {
        const { rows } = await pool.query(
            `UPDATE pedidos SET estado = $1, updated_at = CURRENT_TIMESTAMP,
             fecha_entrega = CASE WHEN $1 = 'entregado' THEN CURRENT_TIMESTAMP ELSE fecha_entrega END
             WHERE id = $2 RETURNING *`,
            [estado, id]
        );
        return rows[0];
    }

    static async getClient() {
        return await pool.connect();
    }
}

module.exports = PedidoModel;
