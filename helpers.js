import fs from "fs";
import { ARTISTS, STANDARD_BACKGROUND, STANDARD_BORDER, QUESTIONS, STANDARD_TEXT } from "./constants.js";

export const getRandomArtistExceptDone = (artists_done) => {
    let tmp_artist = ARTISTS.all.slice()

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
        let artist
        if (username.includes("Rock")) {
            artist = getRandomFromList(ARTISTS.rock)
        } else if (username.includes("Rap")) {
            artist = getRandomFromList(ARTISTS.rap)
        } else if (username.includes("Alternative")) {
            artist = getRandomFromList(ARTISTS.alternative)
        } else if (username.includes("Pop")) {
            artist = getRandomFromList(ARTISTS.pop)
        } else if (username.includes("All")) {
            artist = getRandomFromList(ARTISTS.all)
        }
        let tmp_question_data = getRandomFromList(QUESTIONS)
        let tmp_question = tmp_question_data.question.replace("*artist*", artist.replace("_", " "))
        
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

export default {createQuestions, create_question_data, getRandomQuestions}