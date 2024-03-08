const {addKeyword} = require('@bot-whatsapp/bot')
const axios = require("axios")

var contratos = [];
var especialidades = [];
var cups = [];
var doctors = [];
var disponibilidad = [];

const getFlujoPost = async (apiUrl,datosPost) => {
    try {
      url = 'http://192.168.1.9/api4/'+apiUrl
  
      const response = await axios.post(url,datosPost);
      return response
    } catch (error) {
      // Manejo de errores
      console.error('Error al realizar la solicitud:', error.message);
    }
  };



module.exports = addKeyword('#_AGENDAR_CITA_MEDICA#')
.addAction(async (ctx, { flowDynamic,state}) => {

  const myState = state.getMyState()
  const postData = { 
    tipodoc : myState.tipo,
    documento : myState.documento,
    id : "2",
    token :"ccf3dd148076690fbbffd3397c70c775f77b2ece"
   } 

  const responseData = await getFlujoPost('consultausuario',postData)
  contratos = responseData.data.contratos;
  
  const lista = contratos.map(item => ({
    nit: item.nit,
    nombre: item.contrato,
    contrato: item.cod_contrato,
    tipo: item.tipo_usuario,
    nivel: item.nivel
  }));

  const listaTexto = lista.map((objeto, index) => `*${index+1}.* ${objeto.nombre}`).join('\n');
  await flowDynamic(`${mensajes[3].ms_mensaje}: \n\n${listaTexto}`)
})
.addAction({ capture: true }, async (ctx, { flowDynamic,state,fallBack}) => {
  
  const myState = state.getMyState()
  const codcontrato = contratos[ctx.body-1]
  await state.update({contrato: codcontrato});

  const postData = { 
    tipodoc : myState.tipo,
    documento : myState.documento,
    id : "2",
    token :"ccf3dd148076690fbbffd3397c70c775f77b2ece"
   } 

  const responseData = await getFlujoPost('consultaresp',postData)
  especialidades = responseData.data;
  
  const lista = especialidades.map(item => ({
    esp: item.especialidad,
    codesp: item.citespmed
  }));

  if (ctx.body > 0 && ctx.body <= contratos.length) {
    const listaTexto = lista.map((objeto, index) => `*${index+1}.* ${objeto.esp}`).join('\n');
    await flowDynamic(`${mensajes[4].ms_mensaje}: \n\n${listaTexto} \n \n Por favor, selecciona una de estas opciones`)
  }else{
    return fallBack('Por favor escribir una opción valida')
  }

})

.addAction({ capture: true }, async (ctx, { flowDynamic, state, fallBack }) => {
  const codesp = especialidades[ctx.body-1]
  await state.update({esp: codesp});
  const myState = state.getMyState()

  if (ctx.body > 0 && ctx.body <= especialidades.length) {

    const postData = { 
      esp : myState.esp.CitEspMed,
      id : "2",
      token :"ccf3dd148076690fbbffd3397c70c775f77b2ece"
     } 
  
    const responseData = await getFlujoPost('consultarcup',postData)
    cups = responseData.data;
    
    const lista = cups.map(item => ({
      cups: item.cups,
      cups_det: item.detalle
    }));
  
    const listaTexto = lista.map((objeto, index) => `*${index+1}.* ${objeto.cups_det}`).join('\n');
    await flowDynamic(`${mensajes[5].ms_mensaje}: \n\n${listaTexto} \n \n Por favor, selecciona una de estas opciones `)
  }else{
    return fallBack('Por favor escribir una opción valida')
  }

})
.addAction({ capture: true }, async (ctx, { flowDynamic, state ,gotoFlow,fallBack}) => {
  
  const codesp = cups[ctx.body-1]
  await state.update({cups: codesp});
  const myState = state.getMyState()

  if (ctx.body > 0 && ctx.body <= cups.length) {
      const postData = { 
        codesp : myState.esp.CitEspMed,
        id : "2",
        token :"ccf3dd148076690fbbffd3397c70c775f77b2ece"
      } 

      const responseData = await getFlujoPost('consultarmed',postData)
      doctors = responseData.data;

      if (doctors && doctors.error) {
        await flowDynamic(doctors.error)
        return  gotoFlow(flujoUsuariosRegistrados)
      } else {
        const lista = doctors.map(item => ({
          doctors: item.MMCODM,
          doctors_det: item.nombre
        }));
        const listaTexto = lista.map((objeto, index) => `*${index+1}.* ${objeto.doctors_det}`).join('\n');
        await flowDynamic(`${mensajes[6].ms_mensaje} \n ${listaTexto} \n \n Por favor, selecciona una de estas opciones `)  
      }
    }else{
      return fallBack('Por favor escribir una opción valida')
    }
  
})
.addAction({ capture: true }, async (ctx, { flowDynamic, state, fallBack}) => {
  const codDoctor = doctors[ctx.body-1]
  await state.update({doctor: codDoctor});
  const myState = state.getMyState()

  if (ctx.body > 0 && ctx.body <= doctors.length) {
      const postData = { 
        id : "2",
        token :"ccf3dd148076690fbbffd3397c70c775f77b2ece",
        fecha : "",
        codeEsp : myState.esp.CitEspMed,
        codemed: myState.doctor.MMCODM
      } 
      
      await flowDynamic('⏱️ estamos buscando disponibilidad, un momento por favor...')

      const responseData = await getFlujoPost('consultardis',postData)
      disponibilidad = responseData.data;
      
      const lista = disponibilidad.map(item => ({
        dia: item.nombre_dia,
        fecha: item.fecha_cita,
        hora: item.hora_cita,
        doctor: item.nommed,
      }));

      const listaTexto = lista.map((objeto, index) => `*${index+1}.* ${objeto.dia} ${objeto.fecha}, a las ${objeto.hora} con el Profesional ${objeto.doctor}  `).join('\n');
      await flowDynamic(`${mensajes[7].ms_mensaje}: \n\n${listaTexto} \n \n Por favor, selecciona una de estas opciones `)
  }else{
    return fallBack('Por favor escribir una opción valida')
  }

})
.addAction({ capture: true }, async (ctx, { flowDynamic, state,gotoFlow,fallBack }) => {
  
  const cita = disponibilidad[ctx.body-1]
  await state.update({cita: cita});
  const myState = state.getMyState()

  if (ctx.body > 0 && ctx.body <= disponibilidad.length) {
        const postData = { 
          id : "2",
          token :"ccf3dd148076690fbbffd3397c70c775f77b2ece",
          fecha_cita:myState.cita.fecha_cita,
          hora_cita: myState.cita.hora_cita,
          consultorio: myState.cita.consultorio,	
          tiempo_cita: myState.cita.tiempo_cita,
          tipoCit : myState.cita.tipoCit,
          MPCedu: myState.documento, 
          MPTDoc: myState.tipo,
          MPNOMC: myState.nombre,
          codmed: myState.cita.codmed,
          mecode: myState.cita.mecode,
          nommed: myState.cita.nommed,
          MTCodP: myState.contrato.nivel,
          codCont: myState.contrato.cod_contrato,
          codeCups:	myState.cups.cups
        } 

        const responseData = await getFlujoPost('crearcita',postData)
        insertCita = responseData.data;

      if (insertCita && insertCita.error) {
        await flowDynamic(insertCita.error)
        return gotoFlow(flujoUsuariosRegistrados)
      } else {
        if (insertCita.validacion == 'true') {
          listaTexto = `🏥 Cita agendada correctamente te confirmo los datos:\n \n*Numero de Cita:* ${insertCita.nro_cita} \n*Fecha:* ${insertCita.fecha} \n*Hora:* ${insertCita.hora} \n*Profesional:* ${insertCita.medico} \n*Cuota:* ${insertCita.cuota_moderadora}`;
          
          await flowDynamic(listaTexto)
          return  gotoFlow(flujoUsuariosRegistrados)
        }else {
            await flowDynamic('Error al agendar la Cita, vuelve a intentarlo')
        }
      }

    }else{
      return fallBack('Por favor escribir una opción valida')
    }
})