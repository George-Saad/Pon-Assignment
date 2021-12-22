import express from 'express';
import exphbs from "express-handlebars";
import jediSaberShopRoutes from './routes/jedi-saber-shop.js';
import { getSabers } from './controllers/jedi-saber-shop.js'

const app = express();
const port = process.env.PORT || 3000;

app.engine("handlebars", exphbs({ defaultLayout: false }));
app.set("view engine", "handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/Jedisabershop', jediSaberShopRoutes);

app.get('/', getSabers);

app.listen(port, () => {
  console.log('Server listen on port ', port);
});