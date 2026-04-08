const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const swaggerSpec = require('./config/swagger');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const restauranteRoutes = require('./routes/restaurante.routes');
const platilloRoutes = require('./routes/platillo.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const promocionRoutes = require('./routes/promocion.routes');
const pedidoRoutes = require('./routes/pedido.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/restaurantes', restauranteRoutes);
app.use('/api/platillos', platilloRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/promociones', promocionRoutes);
app.use('/api/pedidos', pedidoRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: '🍔 API de Pedidos de Comida',
        docs: `http://localhost:${PORT}/api-docs`,
        endpoints: {
            auth: '/api/auth',
            restaurantes: '/api/restaurantes',
            platillos: '/api/platillos',
            categorias: '/api/categorias',
            promociones: '/api/promociones',
            pedidos: '/api/pedidos',
        },
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📄 Documentación en http://localhost:${PORT}/api-docs`);
});
