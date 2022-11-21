const express = require('express');
const handlebars = require('express-handlebars');

const app = express();
const port = 3000;

//Sets our app to use the handlebars engine by looking at hbs files
app.set('view engine', 'hbs');

//Sets handlebars configurations (we will go through them later on)
app.engine('hbs', handlebars.engine({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    defaultLayout: 'planB',
    partialsDir: __dirname + '/views/partials/',
}));

//Serves static files (we need it to import a css file)
app.use(express.static('public'))

app.listen(port, () => console.log(`App listening to port ${port}`));

// app.get('/', (req, res) => {
//     //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
// res.render('main', {layout: 'index'});
// });

const fakeApi = () => {
    return [
      {
        name: 'Katarina',
        lane: 'midlaner'
      },
      {
        name: 'Jayce',
        lane: 'toplaner'
      },
      {
        name: 'Heimerdinger',
        lane: 'toplaner'
      },
      {
        name: 'Zed',
        lane: 'midlaner'
      },
      {
        name: 'Azir',
        lane: 'midlaner'
      }
    ];
  };
app.get('/', (req, res) => {
    res.render('chooseAUser', {layout: 'index', suggestedChamps: fakeApi(), listExists: true});
});
