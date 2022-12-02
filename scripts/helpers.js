import fs from "fs";
import { STANDARD_BACKGROUND, STANDARD_BORDER, QUESTIONS, STANDARD_TEXT } from "./constants.js";
import $rdf from "rdflib";

const gameString = fs.readFileSync("./storage/resources.ttl").toString();
const store = $rdf.graph();
$rdf.parse(gameString, store, "http://example.org", "text/turtle");

const queryAllUsers = () => {
    const queryString = `
        SELECT
            ?name ?genre ?id
        WHERE {
            ?genre a <http://example.org/#genre> .
            ?genre <http://example.org/#name> ?name .
            ?genre <http://example.org/#id> ?id .
        }
    `;
    const gameQuery = $rdf.SPARQLToQuery(queryString, false, store);
    return(
        store.querySync(gameQuery).map((result) => {
            return {name: result["?name"].value, id: result["?id"].value};
        })
    )
}


const getRandomArtistExceptDone = (artists_done) => {
    let tmp_artist = queryArtistsFromUsers("all")

    for (let i = artists_done.length -1; i >= 0; i--) {
        tmp_artist.splice(tmp_artist.indexOf(artists_done[i]), 1);
    }
    const artist = tmp_artist[Math.floor(Math.random() * tmp_artist.length)];
    return artist
}

const getRandomFromList = (list) => {
    return list[Math.floor(Math.random() * list.length)]
}

const getRandomQuestions = async (username) => {
    let result_questions  = []
    let result_answers = []
    let result_expected = []

    for (let i = 0; i < 5;) {
        const users = queryArtistsFromUsers(username)
        let artist = getRandomFromList(users)
        let tmp_question_data = getRandomFromList(QUESTIONS)
        let tmp_question = tmp_question_data.question.replace("*artist*", artist.name)
        
        if (result_questions.includes(tmp_question)) {
            continue
        }
        let correct_answer = await tmp_question_data.getCorrectAnswer(artist)
        let tmp_answers = await tmp_question_data.getWrongAnswers(artist, correct_answer)
        let random_index = Math.floor(Math.random() * (tmp_answers.length + 1))
        tmp_answers.splice(random_index, 0, correct_answer)
        
        result_questions.push(tmp_question)
        result_answers.push(tmp_answers)
        result_expected.push(random_index)
        i++
    }

    const to_save = { answers: result_answers, questions: result_questions, expected: result_expected, responses: [] };
    let file = JSON.stringify(to_save, null, 2);
    fs.writeFileSync(`storage/${username}.json`, file);
}

const createQuestions = (username) => {
    let questions;
    let answers;

    answers = [
        ["example answer number 1", "nr 2", "great option number 3", "and incredible unbelivable long answer number absolutly 4"],
        ["example answer number 1 for task 2", "nr 2 for task 2", "great option number 3 for task 2", "and incredible unbelivable long answer number absolutly 4 for task 2"],
        ["example answer number 1", "nr 2", "great option number 3", "and incredible unbelivable long answer number absolutly 4"],
        ["example answer number 1", "nr 2", "great option number 3", "and incredible unbelivable long answer number absolutly 4"],
        ["yex", "yes", "o", "no"]
    ];
    questions = ["this is my qestion now", "and this another one", "aaaaanother one???", "nearly the latest one but only the prev latest", "laaast is here"];
    const expected = [1, 3, 2, 1, 2];
    const to_save = { answers: answers, questions: questions, expected: expected, responses: [] };
    let file = JSON.stringify(to_save, null, 2);
    fs.writeFileSync(`storage/${username}.json`, file);
}

const create_question_data = (userData) => {
    let quests = []
    let tmp_quests = []

    for (let j = 0; j < 5; j++) {
        for (let i = 0; i < 4; i++) {
        let border_color = STANDARD_BORDER;
        let background_color = STANDARD_BACKGROUND;
        let text_color = STANDARD_TEXT;
        if (i == userData.expected[j]) {
            border_color = "green";
            if (userData.responses[j] == i) {
            background_color = "green";
            border_color = STANDARD_BORDER;
            } else
            text_color = "green";
        } else if (i == userData.responses[j]) {
            background_color = "red";
        }
    tmp_quests.push(`style="border-width: 3px; border-color: ${border_color}; background-color: ${background_color}; color: ${text_color};"`);
        }
        quests.push({
        colors: tmp_quests,
        question: userData.questions[j],
        answers: userData.answers[j]
        });
        tmp_quests = [];
    }
    return quests;
}  

const queryArtistsFromUsers = (user) => {
    const queryString = `
        SELECT
            ?name ?artistsId ?awardId ?from ?originId ?id
        WHERE {
            ?artist a <http://dbpedia.org/ontology/#artist> .
            ?artist <http://example.org/#artistsId> ?artistsId .
            ?artist <http://example.org/#awardId> ?awardId .
            ?artist <http://example.org/#from> ?from .
            ?artist <http://example.org/#name> ?name .
            ?artist <http://example.org/#id> ?id .
            ${user == "all" ? "" : `?artist <http://example.org/#genre> <http://example.org/#${user}> .`}
        }
    `;
    const gameQuery = $rdf.SPARQLToQuery(queryString, false, store);
    return(
        store.querySync(gameQuery).map((result) => {
            return ({
                "name": result["?name"].value, 
                "artistId": result["?artistsId"].value, 
                "awardId": result["?awardId"].value, 
                "from": result["?from"].value, 
                "id": result["?id"].value
            });
        })
    )
}

export default {createQuestions, create_question_data, getRandomQuestions, queryAllUsers, getRandomArtistExceptDone, queryArtistsFromUsers}