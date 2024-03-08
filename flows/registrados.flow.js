const {addKeyword} = require('@bot-whatsapp/bot')


module.exports  = addKeyword('#_USUARIOS_REGISTRADOS_#')
.addAction(async(ctx, {flowDynamic,state}) => {
  const myState = state.getMyState()
  await flowDynamic(`👋🏻 Hola ${myState.nombre}, Que deseas hacer :\n  \n 1️⃣ Agendar Cita \n 2️⃣ Cancelar Cita \n 3️⃣ Consultar Citas \n\nSi desea salir del chat por favor escribir  *Salir* `)
})
.addAction({capture:true},
    async(ctx, {fallBack,endFlow,state,gotoFlow}) => {
   
      if ( !['1','2','3'].includes(ctx.body) && ctx.body != 'salir') { 
        return fallBack('Por favor escribir una opción valida')
      
      }else if (ctx.body == 'salir') {
        return endFlow('Gracias por utilizar nuestro canal de whtsapp, te esperamos para una proxima')
      
      } else {
 
        let action = '';
        switch (ctx.body) {
          case "1":
              action = 'agenda'
              return gotoFlow(flowAgenda);
          break;
          case "2":
            action = 'cancela'
              return gotoFlow(flowCancelar);
          break;
          case "3":
              action = 'consulta'
              return gotoFlow(flowConsulta);
          break;
        }
        await state.update({action: action});
      }

})