const {addKeyword} = require('@bot-whatsapp/bot')

const axios = require("axios")

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

module.exports =  addKeyword('#_CONSULTA_CITA_MEDICA#')
.addAction(async (ctx, { flowDynamic,state,gotoFlow}) => {

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
    await flowDynamic(`${listaTexto}`)
    return  gotoFlow(flujoUsuariosRegistrados)
  } else {
    await flowDynamic(`*${dataUserCan.paciente[0].nombre_paciente}*, No tienes citas agendadas.`)
    return  gotoFlow(flujoUsuariosRegistrados)
  }
})