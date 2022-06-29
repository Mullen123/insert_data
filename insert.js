//npm install oracledb
//npm install moment --save 
//npm i chardet
const oracledb = require('oracledb');
const fs = require('fs');
var moment = require('moment'); 
const chardet = require('chardet');
var iconv = require('iconv-lite');


async function run() {

//nombre del archivo
let namefile = "";
//Case ISR
let nameisr = '';
//Case Cancelación
let iscancel = '';

let connection;
let values = new Array();
let datos = new Array();
let longitud = new Array();
let aux = new Array();
let rows = new Array();
let auxrows = new Array();

//let aux_array= new Array();
let result;
let sql;
let  data;
let  val;
let exp_yyyymmdd = /(\d{4})[./-](\d{2})[./-](\d{2})$/;
var exp_csv = /csv/gi;
var exp_txt = /txt/gi;
var exp_num = /^(-)?([0-9]*)\.?[0-9]+$/;
let exp_num2 = /^((0+)([0-9]+))$/;


let codificacion = chardet.detectFileSync(namefile);
console.log(codificacion);


function readFile(){
  if(codificacion != 'UTF-8'){

    if (namefile.match(exp_csv) || namefile.match(exp_txt) ) {
     data = iconv.decode(fs.readFileSync(namefile), codificacion)
     .replace(/,/gi,'|')//remplazamos , por | si es que viene delimitados por comas
     .split('\n') //separamos por salto de linea
    .map(element => element.trim()) //removemos espacion en blanco
    .map(element => element.split('|').
      map(element => element.trim())
        ); //  quitamos el pipe y los espacios por cada linea del arreglo   
//quitamos la parte de los encabezados
val = data.splice(1);

let value  = val.filter(valor =>{
  return valor.length > 1
});
/*evaluamos si es number  o string*/
values = value.map(element=>{
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
}else{

 let  data = fs.readFileSync(namefile)
    .toString() // convertimos el buffer a string
    .replace(/,/gi,'|')//remplazamos , por | si es que viene delimitados por comas
    .split('\n') //separamos por salto de linea
    .map(element => element.trim()) //removemos espacion en blanco
    .map(element => element.split('|').
      map(element => element.trim())
        ); //  quitamos el pipe y los espacios por cada linea del arreglo
    
//quitamos la parte de los encabezados
val = data.splice(1);
/*evaluamos si es number  o string*/
let value  = val.filter(valor =>{
  return valor.length > 1
});
values = value.map(element=>{
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
return values;
}


function addNull(){

  datos = readFile();
  for(i in datos){ longitud= datos[i];
    for(j in longitud){ if(longitud[j] === '' ) { longitud[j] = null } } aux.push(longitud);} 
      return aux;
  }

  function date(){
   rows = addNull();
   for (i in rows){longitud = rows[i];
    for (j in longitud) {if(typeof(longitud[j])=== 'string'&& longitud[j].match(exp_yyyymmdd)){
      if(longitud[j].length == 10){
        longitud[j]= moment(longitud[j]).format('DD-MM-YYYY')
      }
    }
  }
  auxrows.push(longitud);
}
return auxrows;
}


try {

  //generamos una conexión a la base de datos
  connection = await oracledb.getConnection({user: , password: , connectionString: });
  console.log("Conexión Exitosa !!!!");

  /*####################### ADDENDA ###########################*/

  if(namefile.match(/addenda/gi)){

    rows = addNull();
    aux_rows = rows.map(element=>{for (i in element){element[0]  = element[0].toString();}return element;});

    function insertAddenda(){

      try{
        return new Promise( async function(succes,reject){

          sql = `INSERT INTO ADDENDA_`+ nameisr+ `
          (IDNOMINA,NUMERO_RECIBO,PLACA,SECTOR,DESTACAMENTO,USUARIO,CLAVE_COBRO,CARGO,GRADO,TN,TF,TA,TE,TI,TV,TP,TD,TAJUS,TIPO_CONTRATO,PERIODO_PAGO,CONCEPTO_PAGO) values(
          :1, :2, :3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14,:15,:16,:17,:18,:19,:20,:21
          )`;

          result = await connection.executeMany(sql,aux_rows);

          if(result){
            return   succes( "Registros en el documento"+ ' ' +  namefile + ': ' + rows.length + "\n" + result.rowsAffected + ' '+ "Registros insertados");
          }else{

            throw new Error ('error al realizar la inserccion');
          }
        });
      }catch(e){
        return reject(e);
      }
    }
    insertAddenda().then(function(succes){console.log(succes);})
    .catch(function(reject){ console.log(reject);});
    connection.commit();

  }


  /*####################### COMPROBANTES ###########################*/

  else if(namefile.match(/comprobantes/gi)||namefile.includes('DC')){

    rows = date();
    aux_rows = rows.map(element=>{for (i in element){element[1]  = element[1].toString();}return element;});

    function insertComprobantes(){


      try{
        return new Promise( async function(succes,reject){

          sql = `INSERT INTO M4T_COMPROBANTES_DC_33_`+ nameisr+ `
          (IDCOMPROBANTE,IDNOMINA,VERSION,SERIE,FOLIO,FECHA,FORMADEPAGO,SUBTOTAL,DESCUENTO,TOTAL,METODODEPAGO,
          TIPODECOMPROBANTE,MONEDA,LUGAREXPEDICION,RFCEMISOR,NOMBREEMISOR,REGIMENFISCALEMISOR,CURPEMISOR,REGISTROPATRONAL
          ,RFCPATRONORIGEN,ORIGENRECURSO,CANTIDAD,DESCRIPCION,VALORUNITARIO,IMPORTE,PARA,CC,CCO,PROCESADO,ESTATUS,ID_UNIDAD_ADM,IDUSUARIO,
          FG,ST,MONTORECURSOPROPIO,IDSUCURSAL,CONDICIONESDEPAGO,TIPORELACION,UUID,USODECFDI,CLAVEPRODSERV,
          NOIDENTIFICACION,CLAVEUNIDAD,BASE,IMPUESTO,TIPOFACTOR,TASAOCUOTA,UUIDSUCURSAL) values(
          :1, :2, :3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14,:15,:16,:17,:18,:19,:20,:21,:22,:23,:24,:25,:26,:27,:28,:29,:30,
          :31,:32,:33,:34,:35,:36,:37,:38,:39,:40,:41,:42,:43,:44,:45,:46,:47,:48
          )`;

          result = await connection.executeMany(sql,aux_rows);

          if(result){
            return   succes( "Registros en el documento"+ ' ' +  namefile + ': ' + rows.length + "\n" + result.rowsAffected + ' '+ "Registros insertados");
          }else{

            throw new Error ('error al realizar la inserccion');
          }
        });
      }catch(e){
        return reject(e);
      }
    }
    insertComprobantes().then(function(succes){console.log(succes);})
    .catch(function(reject){ console.log(reject);});
    connection.commit();

  }


  /*#######################  DEDUCCIONES ###########################*/

  else if(namefile.match(/deducciones/gi)||namefile.includes('CND')){
   rows = addNull();
   aux_rows = rows.map(element=>{for (i in element){element[1]  = element[1].toString();}return element;});

   function insertDeducciones(){
    try{
      return new Promise( async function(succes,reject){
       sql = `INSERT INTO  M4T_DEDUCCIONES_CND_33_`+ nameisr+ `(IDDEDUCCIONES,IDNOMINA,TOTALOTRASDEDUCCIONES,TOTALIMPUESTOSRETENIDOS,IDUSUARIO,FG,ST)  values(:1, :2, :3, :4, :5 ,:6, :7)`;

       result = await connection.executeMany(sql,aux_rows);

       if(result){
        return   succes( "Registros en el documento"+ ' ' +  namefile + ': ' + rows.length + "\n" + result.rowsAffected + ' '+ "Registros insertados");

      }else{

       throw new Error('error al realizar la inserccion');
     }
   });
    }catch(e){

      return reject(e);
    }
  }
  insertDeducciones().then(function(succes){console.log(succes);})
  .catch(function(reject){ console.log(reject);});
  connection.commit();
}



/*#######################  DEDUCCION  ###########################*/

else if(namefile.match(/deduccion/gi)||namefile.includes('NDD')){
 rows = date();
 aux_rows = rows.map(element=>{for (i in element){  element[2]  = element[2].toString(); element[3]  = element[3].toString(); element[4]  = element[4].toString(); }return element;});

 function insertDeduccion(){
  try{
    return new Promise( async function(succes,reject){
      sql = `INSERT INTO M4T_DEDUCCION_NDD_33_`+ nameisr+ `
      (IDDEDUCCION,IDDEDUCCIONES,IDNOMINA,TIPODEDUCCION,CLAVE,CONCEPTO,IMPORTE,FEC_IMPUTACION,FEC_PAGO,TIPO_PRESTAMO,SUBTIPO_PRESTAMO,IDUSUARIO,FG,ST,SERIE,IMPORTEGRAVADO,IMPORTEEXENTO) values(
      :1, :2, :3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14,:15,:16,:17
      )`;

      result = await connection.executeMany(sql,aux_rows);


      if(result){
        return   succes( "Registros en el documento"+ ' ' +  namefile + ': ' + rows.length + "\n" + result.rowsAffected + ' '+ "Registros insertados");

      }else{

       throw new Error('error al realizar la inserccion');
     }
   });
  }catch(e){

    return reject(e);
  }
}
insertDeduccion().then(function(succes){console.log(succes);})
.catch(function(reject){ console.log(reject);});
connection.commit();
}


/*#######################  HORAS EXTRA ###########################*/

else if(namefile.match(/horasextra/gi)||namefile.includes('CNH')){
 rows = addNull();
 aux_rows = rows.map(element=>{for (i in element){  element[2]  = element[2].toString(); }return element;});

 function insertHrs_Extra(){
  try{
    return new Promise( async function(succes,reject){
      sql = `INSERT INTO M4T_HORASEXTRA_CNH_33_`+ nameisr+ `( IDHORAEXTRA,IDPERCEPCION,IDNOMINA,DIAS,TIPOHORAS,HORASEXTRA,IMPORTEPAGADO,IDUSUARIO,FG,ST)  values(:1, :2, :3, :4, :5 ,:6, :7, :8 ,:9, :10)`;

      result = await connection.executeMany(sql,aux_rows);


      if(result){
        return   succes( "Registros en el documento"+ ' ' +  namefile + ': ' + rows.length + "\n" + result.rowsAffected + ' '+ "Registros insertados");

      }else{

       throw new Error('error al realizar la inserccion');
     }
   });
  }catch(e){

    return reject(e);
  }
}
insertHrs_Extra().then(function(succes){console.log(succes);})
.catch(function(reject){ console.log(reject);});
connection.commit();
}


/*####################### INCAPACIDADES ###########################*/

else if(namefile.match(/incapacidades/gi)||namefile.includes('CNI')){
 rows = addNull();
 aux_rows = rows.map(element=>{for (i in element){  element[1]  = element[1].toString(); }return element;});
 function insertIncapacidad(){
  try{
    return new Promise( async function(succes,reject){
      sql = `INSERT INTO M4T_INCAPACIDADES_CNI_33_`+ nameisr+ `( IDINCAPACIDAD,IDNOMINA,DIASINCAPACIDAD,TIPOINCAPACIDAD,IMPORTEMONETARIO,IDUSUARIO,FG,ST)  values(:1, :2, :3, :4, :5 ,:6, :7, :8)`;

      result = await connection.executeMany(sql,aux_rows);


      if(result){
        return   succes( "Registros en el documento"+ ' ' +  namefile + ': ' + rows.length + "\n" + result.rowsAffected + ' '+ "Registros insertados");

      }else{

       throw new Error('error al realizar la inserccion');
     }
   });
  }catch(e){

    return reject(e);
  }
}
insertIncapacidad().then(function(succes){console.log(succes);})
.catch(function(reject){ console.log(reject);});
connection.commit();
}




/*####################### NOMINA  ###########################*/

else if(namefile.match(/nomina/gi)||namefile.includes('CNR')){
 rows = date();

 aux_rows = rows.map(element=>{for (i in element){ element[0]  = element[0].toString();
  element[19]  = element[19].toString();
  if(element[13] != null){ element[13]  = element[13].toString()}

}return element;});


 function insertNomina(){

  try{
    return new Promise( async function(succes,reject){

      sql = `INSERT INTO M4T_NOMINA12_CNR_33_`+ nameisr+ `( IDNOMINA,IDCOMPROBANTE,RFCRECEPTOR,NOMBRERECEPTOR,
      TIPONOMINA,FECHAPAGO,FECHAINICIALPAGO,FECHAFINALPAGO,NUMDIASPAGADOS,TOTALPERCEPCIONES,TOTALDEDUCCIONES,TOTALOTROSPAGOS,CURP
      ,NUMSEGURIDADSOCIAL,ANTIGUEDAD,TIPOCONTRATO,SINDICALIZADO,TIPOJORNADA,TIPOREGIMEN,NUMEMPLEADO,DEPARTAMENTO,PUESTO,RIESGOPUESTO,
      PERIODICIDADPAGO,BANCO,CUENTABANCARIA,SALARIOBASECOTAPOR,SALARIODIARIOINTEGRADO,CLAVEENTFED,IDUSUARIO,FEC_ULT_ACTUALIZACION,COMENT
      ,SERIE,SECT_PRES,N_SECT_PRES,UNIDAD_ADM,N_UNIDAD_ADM,ZONA_PAGADORA,NUM_PLAZA,UNIVERSO,NIVEL_SALARIAL,COD_PUESTO_CVE_ACT,GRADO,
      N_PUESTO_ACT_ASOC_PROG,SINDICATO,COMISION_SIND,TIPO_CONTRATACION_SUBPROG,PERIODO_PAGO,LEY_CUMPLEANIOS,AVISOS,NUM_CUENTA,
      INICIO_DE_LAB,TURNO_LAB,CODIGO_CONASA,N_CODIGO_CONASA,FG,ST,PERIODO_CONTRATACION,TIPO_NOMINA,FECHAINICIOREALLABORAL,DEDUCCIONESAD,
      CEDULAPROF,FOLIO_CFDI,VERSION,FECHATIMBRADO,SELLOCFD,NOCERTIFICADOSAT,SELLOSAT
      )  values(
      :1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14,:15,:16,:17,:18,:19,:20,:21,:22,:23,:24,:25,:26,:27,:28,:29,:30,:31,:32,:33,:34,:35,:36,:37,:38,:39,:40,:41,:42,:43,:44,:45,:46,:47,:48,:49,:50,:51,:52,:53,:54,:55,:56,:57,:58,:59,:60,:61,:62,:63,:64,:65,:66,:67,:68)`;
      result = await connection.executeMany(sql,aux_rows);


      if(result){
        return   succes( "Registros en el documento"+ ' ' +  namefile + ': ' + rows.length + "\n" + result.rowsAffected + ' '+ "Registros insertados");

      }else{

       throw new Error('error al realizar la inserccion');
     }
   });
  }catch(e){

    return reject(e);
  }
}
insertNomina().then(function(succes){console.log(succes);})
.catch(function(reject){ console.log(reject);});
connection.commit();

}

/*#######################OTROS PAGOS ###########################*/

else if(namefile.match(/otrospagos/gi)||namefile.includes('NOP')){
 rows = addNull();

 aux_rows = rows.map(element=>{for (i in element){element[1]  = element[1].toString(); element[2]  = element[2].toString();}return element;});

 function insertOtros_Pagos(){

  try{
    return new Promise( async function(succes,reject){
      sql = `INSERT INTO M4T_OTROSPAGOS_NOP_33_`+ nameisr+ `(IDOTROPAGO,IDNOMINA,TIPOOTROPAGO,CLAVE,CONCEPTO,IMPORTE,SUBSIDIOCAUSADO,SALDOAFAVOR,ANIO,REMANENTESALDOAFAVOR,IDUSUARIO,FG,ST) 
      values(:1, :2, :3, :4, :5 ,:6, :7, :8 ,:9,:10,:11,:12,:13)`;

      result = await connection.executeMany(sql,aux_rows);


      if(result){
        return   succes( "Registros en el documento"+ ' ' +  namefile + ': ' +  aux_rows.length + "\n" + result.rowsAffected + ' '+ "Registros insertados");

      }else{

       throw new Error('error al realizar la inserccion');
     }
   });
  }catch(e){

    return reject(e);
  }
}
insertOtros_Pagos().then(function(succes){console.log(succes);})
.catch(function(reject){ console.log(reject);});
connection.commit();


}


/*####################### PERCEPCIONES ###########################*/

else if(namefile.match(/percepciones/gi)||namefile.includes('CNP')){
 rows = addNull();
 aux_rows = rows.map(element=>{for (i in element){element[1]  = element[1].toString();}return element;});
 function insertPercepciones(){

  try{
    return new Promise( async function(succes,reject){

     sql = `INSERT INTO M4T_PERCEPCIONES_CNP_33_`+ nameisr+ `(IDPERCEPCIONES,IDNOMINA,TOTALSUELDOS,TOTALSEPARACIONINDEM,
     TOTALJUBILACIONPENSIONRE,TOTALGRAVADO,TOTALEXENTO,TOTALUNAEXHIBICION,
     INGRESOACUMULABLEPEN,INGRESONOACUMULABLEPEN,TOTALPAGADO,NUMANIOSSERVICIO,
     ULTIMOSUELDOMENSORD,INGRESOACUMULABLEINDEM,INGRESONOACUMULABLEINDEM,IDUSUARIO,FG,ST,TOTALPARCIALIDAD,MONTODIARIO ) 
     values(:1, :2, :3, :4, :5 ,:6, :7, :8 ,:9,:10,:11,:12,:13,:14,:15,:16,:17,:18,:19,:20)`;
     result = await connection.executeMany(sql,aux_rows);

     if(result){
      return   succes( "Registros en el documento"+ ' ' +  namefile + ': ' + aux_rows.length + "\n" + result.rowsAffected + ' '+ "Registros insertados");

    }else{

     throw new Error('error al realizar la inserccion');
   }
 });
  }catch(e){

    return reject(e);
  }
}
insertPercepciones().then(function(succes){console.log(succes);})
.catch(function(reject){ console.log(reject);});
connection.commit();
}



/*####################### PERCEPCION ###########################*/

else if(namefile.match(/percepcion/gi)||namefile.includes('NPD')){
 rows = date();
 aux_rows = rows.map(element=>{for (i in element){element[2]  = element[2].toString();}return element;});
 function insertPercepcion(){

  try{
    return new Promise( async function(succes,reject){

      sql = `INSERT INTO M4T_PERCEPCION_NPD_33_`+ nameisr+ `(IDPERCEPCION,IDPERCEPCIONES,IDNOMINA,TIPOPERCEPCION,CLAVE,CONCEPTO,IMPORTEGRAVADO,IMPORTEEXENTO,IMPORTETOTAL,FEC_IMPUTACION,FEC_PAGO,FEC_INICIO_P,FEC_FIN_P,IDUSUARIO,FG,ST,SERIE ) 
      values(:1, :2, :3, :4, :5 ,:6, :7, :8 ,:9,:10,:11,:12,:13,:14,:15,:16,:17)`;
      result = await connection.executeMany(sql,aux_rows);

      if(result){
        return   succes( "Registros en el documento"+ ' ' +  namefile + ': ' + rows.length + "\n" + result.rowsAffected + ' '+ "Registros insertados");

      }else{

       throw new Error('error al realizar la inserccion');
     }
   });
  }catch(e){

    return reject(e);
  }
}
insertPercepcion().then(function(succes){console.log(succes);})
.catch(function(reject){ console.log(reject);});
connection.commit();

}


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