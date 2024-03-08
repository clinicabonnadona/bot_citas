
const {addKeyword} = require('@bot-whatsapp/bot')

module.exports = addKeyword('#_USUARIOS_NO_REGISTRADOS_#')
.addAnswer('deseas registrarte \n *1* SI \n *2* NO',
{capture:true},
    async(ctx, { fallBack,endFlow }) => {
      if ( !['1','2'].includes(ctx.body) ) { 
        return fallBack('Por favor escribir una opción valida')
      }
      if (ctx.body == '2'){ 
        return endFlow('Gracias por utilizar nuestro canal de whtsapp, te esperamos para una proxima')
      }

    }
)