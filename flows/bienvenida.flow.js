const {addKeyword,EVENTS} = require('@bot-whatsapp/bot')
const axios = require("axios");
const registroFlow = require('./registro.flow');
const registradosFlow = require('./registrados.flow');

var listaTipoDoc = [];
var mensajes = [];

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

  const getFlujoGet = async (apiUrl) => {
    try {
      url = 'http://192.168.1.9/api4/'+apiUrl
      const response = await axios.get(url);
      return response
    } catch (error) {
      // Manejo de errores
      console.error('Error al realizar la solicitud:', error.message);
    }
  };

module.exports = addKeyword(EVENTS.WELCOME)
.addAnswer(['Te damos la bienvenida a nuestro canal de WhatsApp, deseas continuar: \n\n *1.* SI \n *2.* NO  '],
 {capture: true},
    async(ctx, { fallBack,endFlow }) => {

      const responseData = await getFlujoGet('getmessage')
      mensajes = responseData.data;

      if ( !['1','2'].includes(ctx.body) ) { 
        return fallBack('Por favor escribir una opción valida')
      }
      if (ctx.body == '2'){ 
        return endFlow('Gracias por utilizar nuestro canal de whtsapp, te esperamos para una proxima')

       }

    }
)
.addAction(async (ctx, { flowDynamic,state}) => {
  const responseData = await getFlujoGet('getipodocs')
  listaTipoDoc = responseData.data;
  const lista = responseData.data.map(item => ({
    tp_id: item.tp_id,
    tp_name: item.tp_name,
    tp_detail: item.tp_detail
  }));

  const listaTexto = lista.map((objeto, index) =>`*${index+1}.* ${objeto.tp_name} (${objeto.tp_detail})`).join('\n');
  await flowDynamic(`${mensajes[1].ms_mensaje}:\n\n${listaTexto} \n \n escribe *volver* para la pregunta anterior \n escribe *Salir* para la pregunta anterior `)
  
})
.addAction({ capture: true }, async (ctx, { flowDynamic,state,fallBack,gotoFlow}) => {    
 
  if (ctx.body == 'volver') {
    return gotoFlow(flowPrincipal, 1)
  }else{

    if (ctx.body > 0 && ctx.body <= listaTipoDoc.length) {
      const objtipoDoc = listaTipoDoc[ctx.body-1].tp_name;
      await state.update({tipo: objtipoDoc});
      await flowDynamic(`${mensajes[2].ms_mensaje}`)
        
      } else {
        return fallBack('Por favor escribir una opción valida')
      }

  }   
})
.addAction({ capture: true }, async (ctx, { flowDynamic, state,gotoFlow }) => {
  await state.update({documento: ctx.body});
  const myState = state.getMyState()
  const postData = { 
    tipodoc : myState.tipo,
    documento : myState.documento,
    id : "2",
    token :"ccf3dd148076690fbbffd3397c70c775f77b2ece"
   } 

  const responseData = await getFlujoPost('consultausuario',postData)
  nameUser = responseData.data;

  // Validar si el objeto contiene la palabra "error"
if (nameUser && nameUser.error) {
  await flowDynamic(nameUser.error)
  return  gotoFlow(registroFlow)
} else {
    console.log(nameUser)
  await state.update({nombre: nameUser.paciente[0].nombre_paciente});
  return  gotoFlow(registradosFlow)
}

})

