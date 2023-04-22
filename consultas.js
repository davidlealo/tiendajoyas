const { Pool } = require("pg");
const { format } = require('util')

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "postgres",
    database: "joyas",
    port: 5432,
    allowExitOnIdle: true
});

const obtenerJoyas = async ({ limits = 5, order_by = 'id_ASC', page = 1 }) => {
    const [campo, direccion] = order_by.split('_')
    const offset = (page - 1) * limits
    const formatedQuery = format("SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s", campo, direccion, limits, offset)
    const { rows } = await pool.query(formatedQuery)
    return rows
}

const estructuraHATEOAS = (inventario) => {
    const results = inventario.map((i) => {
        return {
            nombre: i.nombre,
            href: `/joyas/joya/${i.id}`
        }
    }).slice(0, 4)
    const total = inventario.length
    const HATEOAS = {
        total, results
    }
    return HATEOAS
}

const obtenerJoyasPorFiltros = async ({ precio_max, precio_min, categoria, metal }) => {
    let filtros = []
    const values = []

    const agregarFiltro = (campo, comparador, valor) => {
        values.push(valor)
        const { length } = filtros
        filtros.push(`${campo} ${comparador} $${length + 1}`)
    }
    if (precio_max) agregarFiltro('precio', '<=', precio_max)
    if (precio_min) agregarFiltro('precio', '>=', precio_min)
    if (categoria) agregarFiltro('categoria', '=', categoria)
    if (metal) agregarFiltro('metal', '=', metal)

    let consulta = 'SELECT * FROM inventario'

    if (filtros.length > 0) {
        filtros = filtros.join(' AND ')
        consulta += ` WHERE ${filtros}`
    }

    const { rows } = await pool.query(consulta, values)
    return rows

}

module.exports = { obtenerJoyas, estructuraHATEOAS, obtenerJoyasPorFiltros }