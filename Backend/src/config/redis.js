const { createClient } = require('redis');

let activeClient;
let isMock = false;
const mockStore = new Map();

function enableMock() {
    if (isMock) return;
    isMock = true;
    console.warn('⚠️ Redis connection failed. Using in-memory mock for session token blocklist.');
    
    const oldClient = activeClient;
    activeClient = {
        connect: async () => {
            console.log('Mock Redis connected (in-memory).');
        },
        set: async (key, value) => {
            mockStore.set(key, value);
            return 'OK';
        },
        expireAt: async (key, timestamp) => {
            const delay = (timestamp * 1000) - Date.now();
            if (delay > 0) {
                setTimeout(() => {
                    mockStore.delete(key);
                }, delay);
            } else {
                mockStore.delete(key);
            }
            return 1;
        },
        exists: async (key) => {
            return mockStore.has(key) ? 1 : 0;
        },
        quit: async () => {}
    };

    if (oldClient && typeof oldClient.disconnect === 'function') {
        oldClient.disconnect().catch(() => {});
    }
}

try {
    activeClient = createClient({
        password: process.env.REDIS_PASS,
        socket: {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: process.env.REDIS_PORT || 6379,
            connectTimeout: 2000,
            reconnectStrategy: () => {
                return new Error('Redis connection failed');
            }
        }
    });

    activeClient.on('error', (err) => {
        console.error('Redis Client Error:', err.message);
        enableMock();
    });
} catch (err) {
    console.error('Failed to create Redis client, falling back to mock:', err);
    enableMock();
}

// Override connection function to handle connection errors gracefully
const originalConnect = activeClient ? activeClient.connect.bind(activeClient) : null;
const connectFn = async () => {
    if (!originalConnect) return;
    try {
        await originalConnect();
        console.log('Connected to Redis successfully.');
    } catch (err) {
        console.error('Redis connection failed on startup:', err.message);
        enableMock();
        await activeClient.connect();
    }
};

module.exports = {
    connect: connectFn,
    set: (...args) => activeClient.set(...args),
    expireAt: (...args) => activeClient.expireAt(...args),
    exists: (...args) => activeClient.exists(...args),
    quit: (...args) => activeClient.quit(...args)
};
