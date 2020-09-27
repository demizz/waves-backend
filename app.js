const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const httpError = require('./utils/httpError');
const cloudinary = require('cloudinary');

const dotenv = require('dotenv');
const cors = require('cors');
const brandRoutes = require('./routes/brandRoutes.js');
const woodsRoutes = require('./routes/woodsRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
const articleRoutes = require('./routes/articleRoutes');

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
cloudinary.config({
	clound_name: process.env.CLOUDNAME,
	api_key: process.env.CLOUDKEY,
	api_secret: process.env.CLOUDSECRET,
});

app.use(cors());
app.use('*', cors());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/product/article', articleRoutes);
app.use('/api/v1/product/brand', brandRoutes);
app.use('/api/v1/product/woods', woodsRoutes);

app.use('*', (req, res, next) => {
	return next(new httpError('could not found this route', 404));
});
app.use((err, req, res, next) => {
	res.status(err.code || 500).json({
		message: err.message || 'unkown error',
	});
});

module.exports = app;
