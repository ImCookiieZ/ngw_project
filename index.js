import express from "express";
import handlebars from "express-handlebars";
import helpers from "./scripts/helpers.js";
import fs from "fs";

const app = express();
const port = 3000;


//Sets our app to use the handlebars engine by looking at hbs files
app.set('view engine', 'hbs');

app.engine('hbs', handlebars.engine({
    layoutsDir: './views/layouts',
    extname: 'hbs',
    defaultLayout: 'standard',
    partialsDir: './views/partials/',
}));

//Serves static files (we need it to import a css file)
app.use(express.static('public'))

app.listen(port, () => console.log(`App listening to port ${port}`));

app.get('/', (req, res) => {
  const users = helpers.queryAllUsers()
  const data = {
    layout: "start",
    users: users
  }
  console.log(JSON.stringify(data))
    res.render('chooseAUser', data);
});

app.get('/question', async (req, res) => {
  
  const questionNumbers = ["1st", "2nd", "3rd", "4th", "Last"]
  let current_index = parseInt(req.query.current_index)
  const username = req.query.username
  if (current_index == 0) {
    // create dynamic question/answer initialization here
    await helpers.getRandomQuestions(username);
  }
  const rawdata = fs.readFileSync(`storage/${username}.json`);
  let userData = JSON.parse(rawdata);

  if (current_index != 0) {
    userData.responses.push(parseInt(req.query.answer))
    let file = JSON.stringify(userData, null, 2)
    fs.writeFileSync(`storage/${username}.json`, file)
  }
  
  const data = {
    username: username, 
    last: current_index == 4, 
    questionName:  questionNumbers[current_index],
    quest: {
      question: userData.questions[current_index],
      answers: userData.answers[current_index],
      colors: ["","","",""]
    },
    send_index: current_index + 1,
  }
  res.render('question', data);
});

app.get('/result', (req, res) => {
  const username = req.query.username
  const rawdata = fs.readFileSync(`storage/${username}.json`);
  let userData = JSON.parse(rawdata);
  userData.responses.push(parseInt(req.query.answer))
  let file = JSON.stringify(userData, null, 2)
  fs.writeFileSync(`storage/${username}.json`, file)

  const quests = helpers.create_question_data(userData);
  const data = {
    username: username, 
    quest_1: quests[0],
    quest_2: quests[1],
    quest_3: quests[2],
    quest_4: quests[3],
    quest_5: quests[4],
  }
  res.render('result', data)
});
