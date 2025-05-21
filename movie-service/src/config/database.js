module.exports = {
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'movie_db',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    dialect: 'mysql',
    dialectOptions: {
        charset: 'utf8mb4',
        connectTimeout: 60000,
        authPlugins: {
            mysql_native_password: () => () => Buffer.from([0])
        }
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        charset: 'utf8mb4',
        timestamps: true
    },
    logging: false,
    retry: {
        max: 5,
        match: [
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/,
            /TimeoutError/
        ]
    }
}; 