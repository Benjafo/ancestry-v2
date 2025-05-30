require('dotenv').config(); // Load environment variables at the very top

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var clientRouter = require('./routes/client');
var dashboardRouter = require('./routes/dashboard');
var projectsRouter = require('./routes/projects');
var managerRouter = require('./routes/manager');

// Genealogical data routes
var personsRouter = require('./routes/persons');
var relationshipsRouter = require('./routes/relationships');
var eventsRouter = require('./routes/events');
var documentsRouter = require('./routes/documents');
var userEventsRouter = require('./routes/userEvents');
var servicePackagesRouter = require('./routes/servicePackages');
var ordersRouter = require('./routes/orders');
var paymentsRouter = require('./routes/payments'); // Import payments router

const paymentController = require('./controllers/paymentController');

var app = express();

// Enable CORS for all routes
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);

        // Define allowed origins
        const allowedOrigins = [process.env.CLIENT_ORIGIN || 'http://localhost:5173'];

        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            console.warn('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie']
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

// Stripe webhook needs the raw body, so it must come before express.json() and other body parsers
// This specific route will bypass general middleware like apiLimiter
const bodyParser = require('body-parser'); // Required for raw body parsing for webhooks
app.post('/api/payments/webhook', bodyParser.raw({ type: '*/*' }), paymentController.handleStripeWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Import middleware
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Apply rate limiting to all API routes *except* the webhook
app.use('/api', apiLimiter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/client', clientRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/manager', managerRouter);

// Register genealogical data routes
app.use('/api/persons', personsRouter);
app.use('/api/relationships', relationshipsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/user-events', userEventsRouter);
app.use('/api/service-packages', servicePackagesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter); // Re-add paymentsRouter for other routes

// catch 404 and forward to error handler
app.use(notFoundHandler);

// error handler
app.use(errorHandler);

module.exports = app;
