const {addKeyword} = require('@bot-whatsapp/bot')

const axios = require("axios")

var dataUserCan = [];

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

module.exports = addKeyword('#_CANCELAR_CITA_MEDICA#')
.addAction(async (ctx, { flowDynamic,state,gotoFlow}) => {
  console.log('entra ')
  await flowDynamic('⏱️ Vamos a consultar tus citas agendadas ')

  const myState = state.getMyState()
  const postData = { 
    tipodoc : myState.tipo,
    documento : myState.documento,
    id : "2",
    token :"ccf3dd148076690fbbffd3397c70c775f77b2ece"
   } 

  const responseData = await getFlujoPost('consultausuario',postData)
  dataUserCan = responseData.data;
  
  if (dataUserCan.cita.length > 0) {

    const lista = dataUserCan.cita.map(item => ({
      cita: item.CitNum,
      fecha: item.fecha,
      hora: item.CitHorI,
      doctor: item.medico,
      cups: item.CitNomPr
    }));
  
    const listaTexto = lista.map((objeto, index) => `*${index+1}.* El dia ${objeto.fecha} a las ${objeto.hora} con el Profesional ${objeto.doctor} el procedimiento ${objeto.cups} `).join('\n');
    await flowDynamic(`Por favor seleccionar la *Cita* marcando el numero indicado :\n  \n ${listaTexto}`)

  } else {
    await flowDynamic(`*${dataUserCan.paciente[0].nombre_paciente}*, No tienes citas para cancelar.`)
    return  gotoFlow(flujoUsuariosRegistrados)
  }
})
.addAction({ capture: true }, async (ctx, { flowDynamic,state}) => { 
  const citcancelar = dataUserCan.cita[ctx.body-1]
  await state.update({citacancelar: citcancelar});
  await flowDynamic(`Nombre de persona que esta cancelando la Cita ?`)
})
.addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
  await state.update({ qcancela: ctx.body })
  await flowDynamic(`Por que cancela la cita ?`)
})
.addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
  await state.update({ observacion: ctx.body })
})
.addAction(null, async (ctx, { flowDynamic, state, gotoFlow}) => {
  
  const myState = state.getMyState()
  const postData = { 
    id : "2",
    token :"ccf3dd148076690fbbffd3397c70c775f77b2ece",
    tipodoc: myState.tipo,
    documento: myState.documento,
    citnum: myState.citacancelar.CitNum,
    observacion: myState.observacion,
    qcancela: myState.qcancela,
    parentesco: "P", 
    motivoc: 1
   } 

  const responseData = await getFlujoPost('cancelacita',postData)
  cancelar = responseData.data;

  if (cancelar.validacion == 'true') {
    listaTexto = `✅ Cita cancelada correctamente con el consecutivo: *${cancelar.consecutivo}*`;
    await flowDynamic(listaTexto)
    return  gotoFlow(flujoUsuariosRegistrados)
  }else {
      await flowDynamic(cancelar.error)
      return  gotoFlow(flujoUsuariosRegistrados)
  }
  
})
