var hb = require('handlebars')
var myList = document.querySelector('#yours tbody')
var swarmList = document.querySelector('#theirs tbody')
var rowTemplate = document.getElementById('table-row').text
var tr = hb.compile(rowTemplate)

function newFile (obj) {
  var html = tr(obj)
  if (!obj.host) {
    myList.appendChild($(html)[0])
  } else {
    swarmList.appendChild($(html)[0])
  }
}

function getType(name) {
  return name.substr(name.lastIndexOf('.') + 1).toUpperCase();
}

function getJSON (obj) {
  if (obj.value !== undefined) {
    obj = obj.value    
  }
  return {
    name: obj.name,
    size: obj.size,
    type: getType(obj.name)
  }
}

module.exports.newFile = newFile;
module.exports.getJSON = getJSON;
