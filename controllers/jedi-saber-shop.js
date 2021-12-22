import xml2js from 'xml2js'
import { v4 as uuidv4 } from 'uuid';
import { MongoClient } from 'mongodb'
import { queryXMLSaberFile, loadSaberIntoXML, parseSaberToJs } from './saberXMLFile.js'
import Joi from 'joi';


export function addSaber(req, res) {
  
  const xmlFile = './example.xml';
  const saber = req.body;
  
  const { error } = validateSaber(saber);
  if(error) return res.status(400).json( { message: error.details[0].message });

  loadSaberIntoXML(saber, xmlFile, (err)=>{ 
        if (err) return res.status(400).json( { message: err.message });
        else  return res.status(205).json({'message': 'successfully written our update xml to file'});
  });
}

export function getSaber(req, res) {
  const { id } = req.params;
  queryXMLSaberFile('./example.xml', { id }, (err, node) => {
    if(err) return res.status(400).json( { message: err.message });

    if(node.length == 0) return res.status(404).json({ message: "No saber with ID: " + id + " exists" });

    const parser = new xml2js.Parser();

    parser.parseString(node, function (err, result) {
      if(err) return res.status(400).json( { message: err.message });
      
      const parserdSaber = parseSaberToJs(result.saber)
      return res.status(200).json(parserdSaber);
    }); 
  })
}

export function getSabers(req, res) {
  queryXMLSaberFile('./example.xml', {},(err, node) => {
    if(err) return res.status(400).json( { message: err.message });

    const parser = new xml2js.Parser();
    parser.parseString(node, function (err, result) {
      if(err) return res.status(400).json( { message: err.message });

      const sabers = [];
      if(result.sabers.saber) {
        result.sabers.saber.forEach(element => {
          sabers.push(parseSaberToJs(element))
        });
      }
      return res.status(200).render('index', {"sabers": sabers});
      
    }); 
  })
}

export function addOrder(req, res) {
  const { id } = req.body;
  const orderId = uuidv4();

  var url = "mongodb://localhost:27017/";
  const client = new MongoClient(url);

  queryXMLSaberFile('./example.xml', { id }, (err, node) => {

    if(node.length == 0) return res.status(404).json({ message: "This saber is not available" });

    const parser = new xml2js.Parser();
    parser.parseString(node, async function (err, result) {
      if(err) return res.status(400).json( { message: err.message });
      
      const saber = parseSaberToJs(result.saber);
      const order = {
        orderId: orderId,
        date: Date.now (),
        saber: saber
      }

      try {
        await client.connect();
        const resultDB = await client.db("webshop").collection("orders").insertOne(order);
        console.log(resultDB);
        res.status(201).json({"message": "order succesfull", "lightsabername": result.saber.name});
      } catch(error) {
        return res.status(400).json( { error });
      } finally {
          await client.close();
      }
    });
    
  }) 
}

// use Joi to validate saber input
function validateSaber(saber) {
  
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    available: Joi.number().integer().min(0).required(),
    crystalName: Joi.string().min(1).required(),
    crystalColor: Joi.string().min(1).required(),
  });

  return schema.validate(saber);
}