const nedb = require("nedb-promise");
const express = require("express");

const products = require("./products.json");
const { checkProductInCart } = require("./utils");
const productDatabase = new nedb({ filename: "products.db", autoload: true });
const cart = new nedb({ filename: "cart.db", autoload: true });
const app = express();
app.use(express.json());

//Läs in produkter från JSON till databasen (görs en gång)
function importProducts(products) {
  products.forEach((product) => {
    productDatabase.insert(product);
  });
}
importProducts(products);

// Hämta produkter från databas
app.get("/products", async (request, response) => {
  try {
    const products = await productDatabase.find({});
    response.send(products);
  } catch (err) {
    response.status(500).send("Det uppstod ett fel vid hämtning av produkter.");
  }
});

//Hämta produkter i cart
app.get("/cart", async (request, response) => {
  try {
    const cartProducts = await cart.find({});
    response.send(cartProducts);
  } catch (err) {
    response.status(500).send("Det uppstod ett fel vid hämtning av varukorg.");
  }
});

// Lägg till produkt i varukorg
app.post(
  "/products/add/:title",
  checkProductInCart,
  async (request, response) => {
    try {
      const productTitle = request.params.title;
      const product = await productDatabase.find({ title: productTitle });
      cart.insert({ product });
      const productInCart = await cart.find({});
      response.send({
        success: true,
        message: "Item was added to cart",
        productInCart,
      });
    } catch (error) {
      response
        .status(500)
        .send("Det uppstod ett fel vid hämtning av produkter.");
    }
  }
);

cart.remove({ "product.title": "Spinner" });

app.listen(3000, () => console.log("Server started "));
