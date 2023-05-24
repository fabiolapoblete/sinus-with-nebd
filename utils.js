const nedb = require("nedb-promise");
const cart = new nedb({ filename: "./cart.db", autoload: true });

async function checkProductInCart(request, response, next) {
  const productTitle = request.params.title;
  try {
    const product = await cart.findOne({ "product.title": productTitle });
    if (product) {
      response.status(400).send("Product already in cart");
    } else {
      next();
    }
  } catch (error) {
    response.status(500).send("Something went wrong");
  }
}

module.exports = { checkProductInCart };
