import express from 'express';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import router from './routes/routes.js';


const app = express();

app.use(express.static('public'));

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const uri =
  'mongodb+srv://shreyasavaliya2801:Shreya0801@cluster0.ja95ybi.mongodb.net/?retryWrites=true&w=majority';

const sessionStore = MongoStore.create({
  mongoUrl: uri,
  dbName: 'test',
  collectionName: 'user_driving_test_datas',
});

// Enable sessions
app.use(
  session({
    secret: 'your_secret_key', // Change this to a secure key
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);
app.listen(9090, () => {
  console.log('App is running on port 9090!!');
});

app.use('/', router);

