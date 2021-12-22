import fs from 'fs'
import xpath from 'xpath'
import { DOMParser, XMLSerializer } from 'xmldom'
import crystal_data from '../crystal-data.js'
import { v4 as uuidv4 } from 'uuid';

// used to query the xml saber file
export function queryXMLSaberFile(xmlFile, options, callbackFun) {
  const { id } = options || {};
  const { age } = options || {};
  const { name } = options || {};

  
  fs.readFile(xmlFile, function(err, data) {

    const doc = new DOMParser().parseFromString(data.toString())
    let node = xpath.select("//sabers", doc)

    if(id) {
      node = xpath.select("//saber[id=" + id + "]", doc)
      return callbackFun(err, node);
    }

    if(name) node = xpath.select("//saber[name=" + name + "]", doc)

    if(age) node = xpath.select("//saber[available<" + age + "]", node)

    return callbackFun(err, node);

  });

}

// create a saber xml node that it can be added to the xml file
function createNewSaberNode(saberName, available, crystalName, crystalColor) {
  const saberId = uuidv4();
  const newSaberNode = new DOMParser().parseFromString('<saber></saber>')
  const idNode = new DOMParser().parseFromString('<id>' + saberId + '</id>') 
  const saberNameNode = new DOMParser().parseFromString('<name>' + saberName + '</name>') 
  const availableNode = new DOMParser().parseFromString('<available>' + available + '</available>') 

  newSaberNode.lastChild.appendChild(idNode);
  newSaberNode.lastChild.appendChild(saberNameNode);
  newSaberNode.lastChild.appendChild(availableNode);

  const crystalNode = new DOMParser().parseFromString('<crystal></<crystal>') 
  const crystalNameNode = new DOMParser().parseFromString('<name>' + crystalName + '</name>') 
  const crystalColorNode = new DOMParser().parseFromString('<color>' + crystalColor + '</color>') 
  crystalNode.lastChild.appendChild(crystalNameNode)
  crystalNode.lastChild.appendChild(crystalColorNode)

  newSaberNode.lastChild.appendChild(crystalNode);

  return newSaberNode;
}

// using the createNewSaberNode function to create a saber xml node and add it to the file
export function loadSaberIntoXML(saber, xmlFile, callbackfun) {
  
    queryXMLSaberFile(xmlFile, {}, function(err, node) {
  
      const  newSaber = createNewSaberNode(saber.name, saber.available, saber.crystalName, saber.crystalColor);
      node[0].appendChild(newSaber);
        
      const serializer = new XMLSerializer();
      const xmlString = serializer.serializeToString(node[0])
      
      fs.writeFile(xmlFile, xmlString, function (err) {
        callbackfun(err)
      });
  
    })

  }

  // re-parse the saber object so it match the requirements
export function parseSaberToJs(element) {
  if(!element) return null
  
  console.log(element);

  const saber = {
    id: element.id,
    name: element.name,
    available: element.available,
    crystal: {
      name: element.crystal[0].name,
      color: element.crystal[0].color,
      type: crystal_data.crystals[element.crystal[0].color[0]].name,
      fNeeded: crystal_data.crystals[element.crystal[0].color[0]].power,
       price: Math.round(crystal_data.crystals[element.crystal[0].color[0]].price*crystal_data.crystals[element.crystal[0].color[0]].power/100)
    },
    F: 10 * element.available
  }

  return saber

}