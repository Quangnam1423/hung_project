const amqp = require('amqplib');
const config = require('./config');

const movieController = require('./controllers/movie');
const orderController = require('./controllers/order');
const modelsPromise = require('./models');

console.log('> movie service starting...');

/**
 * Create RabbitMQ channel
 * @param {string} q Queue name
 * @returns {Promise<amqp.channel | Error>}
 */
async function createChannel(q) {
    const connection = await amqp.connect(config.amqp_url);
    const channel = await connection.createChannel();
    await channel.assertQueue(q);
    //NOTE: set maximum allowed number of unacknowledged messages
    channel.prefetch(1);
    return channel;
}

/**
 * Process message from queue
 * @param {amqp.channel} channel
 * @param {object} msg
 * @param {Buffer} msg.content
 * @returns {Promise<void|Error>}
 */
async function processMessage(channel, msg, models) {
    if(msg === null) return;
    try {
        const data = JSON.parse(msg.content.toString());

        console.log('Dispatch action: ', data.action);
        let actionResult = null;

        switch (data.action){
            case 'movie.create':
                actionResult = await movieController.create(data.body);
                break;
            case 'movie.getAll':
                actionResult = await movieController.getAll();
                break;
            case 'movie.getById':
                actionResult = await movieController.getById(parseInt(data.body));
                break;
            case 'movie.getTrailer':
                actionResult = await movieController.getTrailer(data.body);
                break;
            case 'order.create':
                actionResult = await orderController.create(data.body);
                break;
            case 'order.getAll':
                actionResult = await orderController.getAll();
                break;
            default:
                throw new Error('Invalid action name');
        }

        const response = {
            code: 200,
            body: actionResult
        };

        channel.ack(msg);
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {correlationId: msg.properties.correlationId});

    } catch (e) {
        console.error('Error in movie-service:', e);
        const response = {
            code: e.code || 500,
            error: e.message || 'Error in movie-service'
        };
        if(process.env.NODE_ENV !== 'production') response.stack = e.stack;
        channel.ack(msg);
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {correlationId: msg.properties.correlationId});
    }
}

async function startService() {
    try {
        const models = await modelsPromise;
        if (!models.db || !models.Movie || !models.Seats || !models.Order) {
            throw new Error('Database models not initialized');
        }
        // Start listening for messages
        const channel = await createChannel(config.movies_q);
        console.log('> movie service listening for messages');
        channel.consume(config.movies_q, msg => processMessage(channel, msg, models));
    } catch (err) {
        console.error('> Failed to initialize database models:', err);
        process.exit(1);
    }
}

// Start the service
startService();