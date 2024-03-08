const { createBot, createProvider, createFlow } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const express = require('express')
const bodyParser = require('body-parser');
const registroFlow = require('./flows/registro.flow')
const bienvenidaFlow = require('./flows/bienvenida.flow')
const agendaFlow = require('./flows/agenda.flow')
const cancelacionFlow = require('./flows/cancelacion.flow')
const consultaFlow = require('./flows/consulta.flow')
const salirFlow = require('./flows/salir.flow')


const app = express()
const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([bienvenidaFlow,agendaFlow,cancelacionFlow,consultaFlow,registroFlow,salirFlow])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })


    QRPortalWeb()

      /**
     * Enviar mensaje con metodos propios del provider del bot
     */
      const app = express();
      app.use(bodyParser.json());

      app.post('/send-message-bot', async (req, res) => {

        const objetos = req.body;

        // Bucle for para recorrer cada objeto
      for (let i = 0; i < objetos.length; i++) {
        const nombre = objetos[i].nombre;
        const medico = objetos[i].med;

      // Enviar mensaje usando los datos del objeto actual
        await adapterProvider.sendText(`${objetos[i].num}@c.us`, `Hola ${nombre}, te recordamos tu cita ${nombre} con el médico ${medico}`);
      }

      // Enviar la respuesta después de completar el ciclo
      res.send({ data: 'enviado!' });

       // await adapterProvider.sendText(`${numero}@c.us`, `Hola ${nombre}, te recordamos tu cita ${nombre} con el medico ${medico} `)
       // res.send({ data: 'enviado!' })

      })
  
      const PORT = process.env.PORT || 4000;
      app.listen(PORT, () => console.log(`http://localhost:${PORT}`))
}

main()
