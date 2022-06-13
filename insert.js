//npm install oracledb
//npm install moment --save 
const oracledb = require('oracledb');
const fs = require('fs');
var moment = require('moment'); 

async function run() {

  /*nombre del archivo*/
  let namefile =  "M4T_COMPROBANTES_DC_33.TXT";

//AQUI VA EL NOMBRE DEL ESQUEMA DONDE VAMOS A ALMACENAR
let nameisr = 'isr99';



let connection;
let values = new Array();
let datos = new Array();
let longitud = new Array();
let aux = new Array();
let rows = new Array();
let auxrows = new Array();
let aux_array= new Array();
let result;
let sql;
let exp_yyyymmdd = /(\d{4})[./-](\d{2})[./-](\d{2})$/;
var exp_csv = /csv/gi;
var exp_txt = /txt/gi;
var exp_num = /^([0-9]*)\.?[0-9]+$/;
let exp_num2 = /^((0+)[0-9]*)\.?[0-9]+$/;


function extension() {

  if (namefile.match(exp_csv)) {

   let  data = fs.readFileSync(namefile)
    .toString() // convertimos el buffer a string
    .split('\n') //separamos por salto de linea
    .map(element => element.trim()) //removemos espacion en blanco
    .map(element => element.split('|').
      map(element => element.trim())
        ); //  quitamos el pipe y los espacios por cada linea del arreglo
    
//quitamos la parte de los encabezados
let val = data.splice(1);
/*evaluamos si es number  o string*/
values = val.map(element=>{
 for(i in element){
  if(!element[i].match(exp_num)){
    element[i] = element[i];
  }else{
    if(element[i].match(exp_num2)){element[i] = element[i]; }
    else{ element[i] =+ element[i];}}
  }
  return element ;
});

} else if (namefile.match(exp_txt)) {


   let  data = fs.readFileSync(namefile,'utf8')
    .toString() // convertimos el buffer a string
    .split('\n') //separamos por salto de linea
    .map(element => element.trim()) //removemos espacion en blanco
    .map(element => element.split('|').
      map(element => element.trim())
        ); //  quitamos el pipe y los espacios por cada linea del arreglo
    
//quitamos la parte de los encabezados
let val = data.splice(1);
/*evaluamos si es number  o string*/
values = val.map(element=>{
 for(i in element){
  if(!element[i].match(exp_num)){
    element[i] = element[i];
  }else{
    if(element[i].match(exp_num2)){element[i] = element[i]; }
    else{ element[i] =+ element[i];}}
  }
  return element ;
});
}
  //console.log(values);
  return values;

}//termina la funcion extension

console.log(extension());











try {

  //generamos una conexión a la base de datos
  //connection = await oracledb.getConnection({ user: "", password: "", connectionString: "" });
  //console.log("Conexión Exitosa !!!!");



}catch (err) {
  console.error(err);
} finally {
  if (connection) {
    try {
      await connection.close();
    } catch (err) {
      console.error(err);
    }
  }
}

}//termina la funcion run

run();


