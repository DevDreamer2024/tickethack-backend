const mongoose = require('mongoose');

const connectionString = "mongodb+srv://aureliencatala:kaFt8Gubr3VJ8cR4@cluster0.7f9ecap.mongodb.net/tickethack";

mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log('Database connected'))
  .catch(error => console.error(error));