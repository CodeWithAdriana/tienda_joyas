const { Pool } = require("pg");
const format = require("pg-format");

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'joyas',
    password: '1234',
    port: 5432,
    allowExitOnIdle: true,
});

// Función para obtener las joyas con paginación, límite y orden
const obtenerJoyas = async ({ limits = 10, page = 1, order_by = "id_ASC" }) => {
    try {
        const [columna, orden] = order_by.split("_");
        const offset = (page - 1) * limits;

        // Consulta con paginación y orden
        let consulta = format(
            "SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s",
            columna,
            orden,
            limits,
            offset
        );

        // Ejecutamos la consulta principal
        const { rows: inventario } = await pool.query(consulta);

        // Obtener el total de joyas para calcular las páginas
        const totalJoyasResult = await pool.query("SELECT COUNT(*) FROM inventario");
        const totalJoyas = totalJoyasResult.rows[0].count;
        const totalPages = Math.ceil(totalJoyas / limits);

        // Estructura HATEOAS con los links de navegación
        return {
            data: inventario,
            links: {
                self: `/inventario?limits=${limits}&page=${page}&order_by=${order_by}`,
                next: page < totalPages ? `/inventario?limits=${limits}&page=${page + 1}&order_by=${order_by}` : null,
                prev: page > 1 ? `/inventario?limits=${limits}&page=${page - 1}&order_by=${order_by}` : null,
            },
            totalJoyas,  // Extra: Para mostrar el total de joyas
            totalPages,  // Extra: Para mostrar el total de páginas
        };

    } catch (error) {
        console.error("Error al obtener joyas:", error);
        throw error;
    }
};

// Función para obtener joyas filtradas por precio, categoría y metal
const obtenerJoyasFiltradas = async ({ precio_max, precio_min, categoria, metal }) => {
    try {
        let filtros = [];
        if (precio_max) filtros.push(`precio <= ${precio_max}`);
        if (precio_min) filtros.push(`precio >= ${precio_min}`);
        if (categoria) filtros.push(format("categoria = %L", categoria));
        if (metal) filtros.push(format("metal = %L", metal));

        let consulta = "SELECT * FROM inventario";
        if (filtros.length > 0) {
            consulta += " WHERE " + filtros.join(" AND ");
        }

        // Ejecutamos la consulta de filtrado
        const { rows: joyas } = await pool.query(consulta);
        return joyas;
    } catch (error) {
        console.error("Error al filtrar joyas:", error);
        throw error;
    }
};

module.exports = { obtenerJoyas, obtenerJoyasFiltradas };
