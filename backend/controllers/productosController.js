// Contenido inicial para productosController.js 
// En productosController.js
exports.filtrarProductos = async (req, res) => {
    try {
        const { minPrecio, maxPrecio } = req.query;
        const productos = await Producto.find({
            precio: { $gte: minPrecio || 0, $lte: maxPrecio || Infinity }
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};