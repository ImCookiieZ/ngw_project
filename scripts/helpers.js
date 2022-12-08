import fs from "fs";
import { STANDARD_BACKGROUND, STANDARD_BORDER, QUESTIONS, STANDARD_TEXT } from "./constants.js";
import $rdf from "rdflib";

const gameString = fs.readFileSync("./storage/resources.rdf").toString(); //read the text of the rdf file
const store = $rdf.graph(); //create an rdf graph
$rdf.parse(gameString, store, "http://example.org", "application/rdf+xml"); //parse the read text as an rdf/xml foöe into an example website, and host it there

const queryAllUsers = () => { // get all users inside the rdf file
    const queryString = `
        prefix exo: <http://example.org/#>
        prefix dbp: <http://dbpedia.org/ontology/#>
        SELECT
            ?name ?id
        WHERE {
            ?user a exo:user .
            ?user exo:name ?name .
            ?user exo:favorite_genre ?genre .
            ?genre exo:id ?id .
        }
    `;
    const gameQuery = $rdf.SPARQLToQuery(queryString, false, store);
    return(
        store.querySync(gameQuery).map((result) => {
            return {name: result["?name"].value, favorite_genre_id: result["?id"].value}; //reformat the output to be an array of json containing only name and id from the query result
        })
    )
}


const getRandomArtistExceptDone = (artists_done) => { // get all users from rdf file except those with the same name as those in the parameter
    let all_artist = queryArtistsFromFavoriteGenre("all")
    let names = artists_done.map((x) => x.name);
    let not_done = []

    for (const element of all_artist) {
        const indexof = names.indexOf(element.name)
        if (indexof < 0) {
            not_done.push(element)
        }
    }
    const artist = not_done[Math.floor(Math.random() * not_done.length)];
    return artist
}

const getRandomFromList = (list) => { //choose a ranodom element from an array
    return list[Math.floor(Math.random() * list.length)]
}

const getRandomQuestions = async (username) => { //create 5 different random questions where eather the artist or the question type (from, active, song, awards) differs
    let result_questions  = []
    let result_answers = []
    let result_expected = []

    for (let i = 0; i < 5;) {
        const users = queryArtistsFromFavoriteGenre(username) //get artists from the genre the user has as favorite
        let artist = getRandomFromList(users)
        let tmp_question_data = getRandomFromList(QUESTIONS)
        let tmp_question = tmp_question_data.question.replace("*artist*", artist.name) // replace the placehoulder for the artist with the artist name
        
        if (result_questions.includes(tmp_question)) { //be sure the question is not already existing in the combination of artist and question type
            continue
        }
        let correct_answer = await tmp_question_data.getCorrectAnswer(artist)
        let tmp_answers = await tmp_question_data.getWrongAnswers(artist, correct_answer)
        let random_index = Math.floor(Math.random() * (tmp_answers.length + 1)) // put the correct answer on a random position on the website but save where it is
        tmp_answers.splice(random_index, 0, correct_answer)
        
        result_questions.push(tmp_question)
        result_answers.push(tmp_answers)
        result_expected.push(random_index)
        i++
    }

    const to_save = { answers: result_answers, questions: result_questions, expected: result_expected, responses: [] }; //create a json for the user
    let file = JSON.stringify(to_save, null, 2);
    fs.writeFileSync(`storage/${username}.json`, file); //save the data about the questions, answers and correct results
}

const create_question_data = (userData) => { // find out wether a question was correctly responded or not and color the answers depending on this
    let quests = []
    let tmp_quests = []

    for (let j = 0; j < 5; j++) {
        let correct = 0
        for (let i = 0; i < 4; i++) {
            let border_color = STANDARD_BORDER;
            let background_color = STANDARD_BACKGROUND;
            let text_color = STANDARD_TEXT;
            if (i == userData.expected[j]) { //if the current answer is the correct answer
                if (userData.responses[j] == i) { //if the user responded correctly, the border as well as the text is black but the button is filled green
                    background_color = "green";
                    correct = 1
                } else { // if the user did not responded correctly, the border and the text is green
                    text_color = "green"; 
                    border_color = "green";
                }
            } else if (i == userData.responses[j]) { //if the user responded this answer but it is false, fill it with red
                background_color = "red";
            }
            tmp_quests.push(`style="border-width: 3px; border-color: ${border_color}; background-color: ${background_color}; color: ${text_color};"`); //apply this style to the button
        }
        quests.push({
            colors: tmp_quests,
            question: userData.questions[j],
            answers: userData.answers[j],
            correct: correct 
        });
        tmp_quests = [];
    }
    return quests;
}  

const queryArtistsFromFavoriteGenre = (genre) => { // find all  artists that are in a specific genre
    const queryString = `
        prefix exo: <http://example.org/#>
        prefix dbp: <http://dbpedia.org/ontology/#>
        SELECT
            ?name ?artistsId ?awardId ?from ?originId ?id
        WHERE {
            ?artist a <http://dbpedia.org/ontology/#artist> .
            ?artist exo:artistsId ?artistsId .
            ?artist exo:awardId ?awardId .
            ?artist exo:from ?from .
            ?artist exo:name ?name .
            ?artist exo:id ?id .
            ${genre == "all" ? "" : `?artist exo:genre exo:${genre} .`}
        }
    `; //if the gerne is "all": collect all artists
    const gameQuery = $rdf.SPARQLToQuery(queryString, false, store);
    return(
        store.querySync(gameQuery).map((result) => {
            return ({
                "name": result["?name"].value, 
                "artistId": result["?artistsId"].value, 
                "awardId": result["?awardId"].value, 
                "from": result["?from"].value, 
                "id": result["?id"].value
            }); //reformat for usefull usage
        })
    )
}

export default {create_question_data, getRandomQuestions, queryAllUsers, getRandomArtistExceptDone, queryArtistsFromUsers: queryArtistsFromFavoriteGenre} //export the functions as a default object