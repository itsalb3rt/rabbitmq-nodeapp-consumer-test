var amqp = require('amqplib/callback_api')
module.exports = (callback) => {
    amqp.connect(`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_USER}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
        (error, conection) => {
            if (error) {
                throw new Error(error);
            }

            callback(conection);
        })
}