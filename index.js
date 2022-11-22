const express = require('express');
const handlebars = require('express-handlebars');
const fs = require('fs');

const app = express();
const port = 3000;

const standard_border = "black"
const standard_background = "rgb(250,250,250)"
const standard_text = "black"

//Sets our app to use the handlebars engine by looking at hbs files
app.set('view engine', 'hbs');

//Sets handlebars configurations (we will go through them later on)
app.engine('hbs', handlebars.engine({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    defaultLayout: 'index',
    partialsDir: __dirname + '/views/partials/',
}));

//Serves static files (we need it to import a css file)
app.use(express.static('public'))

app.listen(port, () => console.log(`App listening to port ${port}`));

// app.get('/', (req, res) => {
//     //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
// res.render('main', {layout: 'index'});
// });

app.get('/', (req, res) => {
    res.render('chooseAUser');
});

app.get('/question', (req, res) => {
  
  const questionNumbers = ["1st", "2nd", "3rd", "4th", "Last"]
  let answers
  let questions
  let current_index = parseInt(req.query.current_index)
  const username = req.query.username
  if (current_index == 0) {
  // create dynamic question/answer initialization here
    answers = [
      ["example answer number 1", "nr 2", "great option number 3", "and incredible unbelivable long answer number absolutly 4"],
      ["example answer number 1 for task 2", "nr 2 for task 2", "great option number 3 for task 2", "and incredible unbelivable long answer number absolutly 4 for task 2"],
      ["example answer number 1", "nr 2", "great option number 3", "and incredible unbelivable long answer number absolutly 4"],
      ["example answer number 1", "nr 2", "great option number 3", "and incredible unbelivable long answer number absolutly 4"],
      ["yex", "yes", "o", "no"]
    ]
    questions = ["this is my qestion now", "and this another one", "aaaaanother one???", "nearly the latest one but only the prev latest", "laaast is here"]
    const expected = [1, 3, 2, 1, 2]
    const to_save = {answers: answers, questions: questions, expected: expected, responses: []}
    let file = JSON.stringify(to_save, null, 2)
    fs.writeFileSync(`storage/${username}.json`, file)
  }
  const rawdata = fs.readFileSync(`storage/${username}.json`);
  let userData = JSON.parse(rawdata);

  if (current_index != 0) {
    userData.responses.push(parseInt(req.query.answer))
    let file = JSON.stringify(userData, null, 2)
    fs.writeFileSync(`storage/${username}.json`, file)
  }
  

  const data = {
    layout: 'index', 
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
  console.log(data)
  res.render('question', data);
});

app.get('/result', (req, res) => {

  const username = req.query.username

  const rawdata = fs.readFileSync(`storage/${username}.json`);
  let userData = JSON.parse(rawdata);
  userData.responses.push(parseInt(req.query.answer))
  let file = JSON.stringify(userData, null, 2)
  fs.writeFileSync(`storage/${username}.json`, file)
  let quests = []
  let tmp_quests = []

  for (let j = 0; j  < 5; j++) {
    for (let i = 0; i < 4; i++) {
      let border_color = standard_border
      let background_color = standard_background
      let text_color = standard_text
      if (i == userData.expected[j]) {
        border_color = "green"
        if (userData.responses[j] == i) {
          background_color = "green"
          border_color = standard_border
        } else text_color ="green"
      } else if (i == userData.responses[j]) {
        background_color= "red"
      }
      tmp_quests.push(`style="border-width: 3px; border-color: ${border_color}; background-color: ${background_color}; color: ${text_color};"`)
    }
    quests.push({
        colors: tmp_quests,
        question: userData.questions[j],
        answers: userData.answers[j]
    }) 
    tmp_quests = []
  }
  const data = {
    layout: 'index', 
    username: username, 
    quest_1: quests[0],
    quest_2: quests[1],
    quest_3: quests[2],
    quest_4: quests[3],
    quest_5: quests[4],
  }
  res.render('result', data)
});