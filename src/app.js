var express = require('express')
var bodyParser = require('body-parser')
var rabbitMQHandler = require('./connection')
var dotenv = require('dotenv');

dotenv.config();

let app = express()
let router = express.Router()
let server = require('http').Server(app)
let socketIO = require('socket.io')(server)

let calcSocket = socketIO.of('/calc')

rabbitMQHandler((connection) => {
  connection.createChannel((err, channel) => {
    if (err) {
      throw new Error(err);
    }
    var mainQueue = 'calc_sum'

    channel.assertQueue('', { exclusive: true }, (err, queue) => {
      if (err) {
        throw new Error(err)
      }
      channel.bindQueue(queue.queue, mainQueue, '')
      channel.consume(queue.que, (msg) => {

        let task = JSON.parse(msg.content.toString())
        let result = { result: Number(task.task.a) + Number(task.task.b) };

        calcSocket.emit('calc', JSON.stringify(result))

      })
    }, { noAck: true })
  })
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use('/api', router)
router.route('/calc/sum').post((req, res) => {
  rabbitMQHandler((connection) => {
    connection.createChannel((err, channel) => {
      if (err) {
        throw new Error(err)
      }
      var ex = 'calc_sum'
      var msg = JSON.stringify({ task: req.body });

      channel.publish(ex, '', new Buffer(msg), { persistent: false })

      channel.close(() => { connection.close() })
    })
  })
})

server.listen(process.env.EXPOSED_PORT, '0.0.0.0',
  () => {
    console.log(`Running at http://localhost:${process.env.EXPOSED_PORT}`)
  }
)