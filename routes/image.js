import express from 'express';
import fileUpload from 'express-fileupload';
import { saveAsset } from '../controllers/Asset.js';

const img = express();

// Use express-fileupload middleware
img.use(fileUpload());

// Your other routes and configurations...

// Route for handling asset saving
img.post('/saveAsset', saveAsset);

export default img;

