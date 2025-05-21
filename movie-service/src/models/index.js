const Sequelize = require('sequelize');
const config = require('../config/database');

/**
 * Retry database connection
 * @param {number} retries Number of retries
 * @param {number} delay Delay between retries in ms
 * @returns {Promise<{db, Movie, Seats, Order}>}
 */
async function connectWithRetry(retries = 5, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`> Attempting to connect to MySQL (attempt ${i + 1}/${retries})...`);
            const db = new Sequelize(config.database, config.username, config.password, {
                host: config.host,
                port: config.port,
                dialect: config.dialect,
                dialectOptions: config.dialectOptions,
                pool: config.pool,
                define: config.define,
                logging: config.logging,
                retry: config.retry
            });
            
            await db.authenticate();
            console.log('> Connected to MySQL successfully');

            // Initialize models
            const Movie = require('./movie')(db);
            const Seats = require('./seat')(db);
            const Order = require('./order')(db);

            // Define relationships
            Movie.hasMany(Seats);
            Order.belongsTo(Movie);
            Seats.belongsToMany(Order, {through: 'OrderSeats'});
            Order.belongsToMany(Seats, {through: 'OrderSeats'});

            // Sync database
            await db.sync();
            console.log('> Database synchronized successfully');

            return { db, Movie, Seats, Order };
        } catch (err) {
            console.error(`> Failed to connect to MySQL (attempt ${i + 1}/${retries}):`, err.message);
            if (i < retries - 1) {
                console.log(`> Retrying in ${delay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw err;
            }
        }
    }
}

module.exports = connectWithRetry();


