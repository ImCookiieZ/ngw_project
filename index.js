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

//Server listens to port 3000
app.listen(port, () => console.log(`App listening to port ${port}`));

//a home route rendering the side for the user to choose a profile
app.get('/', (req, res) => {
  const users = helpers.queryAllUsers() //query all users from the rdf file
  const data = {
    layout: "start",
    users: users
  }
    res.render('chooseAUser', data); //render and send the html site for choosing the user
});


//a question route rendering the side for the user to fullfill a question within the quiz
app.get('/question', async (req, res) => {
  
  const questionNumbers = ["1st", "2nd", "3rd", "4th", "Last"]
  let current_index = parseInt(req.query.current_index)
  const username = req.query.username
  //on first execution the webpage generates all question as well as possible answers and saves what the correct answer would be
  if (current_index == 0) {
    // create dynamic question/answer initialization
    await helpers.getRandomQuestions(username);
  }
  const rawdata = fs.readFileSync(`storage/${username}.json`); // read the data about the generated questinos and answers for the specific user
  let userData = JSON.parse(rawdata); // convert to json

  if (current_index != 0) { // save the answer that was given to the question before in a file
    userData.responses.push(parseInt(req.query.answer))
    let file = JSON.stringify(userData, null, 2) // make json file easy to read
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
  res.render('question', data); ////render and send the html site for cthe current question
});

//a result route rendering the side for the user to see the given answers and if they were right or wrong
app.get('/result', (req, res) => {
  const username = req.query.username
  const rawdata = fs.readFileSync(`storage/${username}.json`); // read the data about the generated questinos and answers for the specific user
  let userData = JSON.parse(rawdata);
  userData.responses.push(parseInt(req.query.answer))
  let file = JSON.stringify(userData, null, 2) // make json file easy to read
  fs.writeFileSync(`storage/${username}.json`, file) //save the last answer from the questions before

  const quests = helpers.create_question_data(userData); //create the styles got the questions to color right and wrong answers
  let correct = 0
  for (let question of quests) { //count the correct answers
    correct += question.correct
  }
  const data = {
    username: username, 
    quest_1: quests[0],
    quest_2: quests[1],
    quest_3: quests[2],
    quest_4: quests[3],
    quest_5: quests[4],
    correctAnswers: correct
  }
  res.render('result', data) //render the result page
});
