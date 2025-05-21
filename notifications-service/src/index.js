const amqp = require('amqplib');
const config = require('./config');
const notificationController = require('./controllers/notification');

console.log('> notification service starting...');

/**
 * Retry connection to RabbitMQ
 * @param {number} retries Number of retries
 * @param {number} delay Delay between retries in ms
 * @returns {Promise<amqp.channel>}
 */
async function connectWithRetry(retries = 5, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`> Attempting to connect to RabbitMQ (attempt ${i + 1}/${retries})...`);
            const connection = await amqp.connect(config.amqp_url);
            console.log('> Connected to RabbitMQ successfully');
            
            connection.on('error', (err) => {
                console.error('> RabbitMQ connection error:', err);
                process.exit(1);
            });

            connection.on('close', () => {
                console.log('> RabbitMQ connection closed');
                process.exit(1);
            });

            const channel = await connection.createChannel();
            await channel.assertQueue(config.q);
            return channel;
        } catch (err) {
            console.error(`> Failed to connect to RabbitMQ (attempt ${i + 1}/${retries}):`, err.message);
            if (i < retries - 1) {
                console.log(`> Retrying in ${delay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw err;
            }
        }
    }
}

/**
 * Process message from queue
 * @param {amqp.channel} channel
 * @param {object} msg
 * @param {Buffer} msg.content
 * @returns {Promise<void|Error>}
 */
async function consume(channel, msg) {
    if(msg === null) return;
    try {
        const mail = JSON.parse(msg.content.toString());
        console.log(`> Sending email to ${mail.to} ...`);
        await notificationController.send(mail);
        console.log(`> Email has been successfully sent to ${mail.to}`);
        channel.ack(msg);
    } catch (e) {
        console.error('> Error processing message:', e);
        // Reject message and requeue if it's a temporary error
        channel.nack(msg, false, true);
    }
}

// Start the service
connectWithRetry()
    .then(channel => {
        console.log('> Notification service listening for messages');
        channel.consume(config.q, msg => consume(channel, msg));
    })
    .catch(err => {
        console.error('> Failed to start notification service:', err);
        process.exit(1);
    });