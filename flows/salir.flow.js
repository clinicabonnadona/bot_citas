const {addKeyword} = require('@bot-whatsapp/bot')

module.exports = addKeyword('salir')
.addAction(null, async (ctx, {endFlow}) => {
      return endFlow('Gracias por utilizar nuestro canal de whtsapp, te esperamos para una proxima')
    }
)