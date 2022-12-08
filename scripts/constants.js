import helpers from "./helpers.js";
import dataFetcher from "./getOnlineData.js"

export const STANDARD_BORDER = "black"
export const STANDARD_BACKGROUND = "rgb(250,250,250)"
export const STANDARD_TEXT = "black"
export const ENDPOINT_URL_DBPEDIA = 'https://dbpedia.org/sparql'
export const ENDPOINT_URL_WIKIDATA = 'https://query.wikidata.org/sparql'


const activeQuestion = { //constant for creating a question for the timespan an artist was active
    question: "When was *artist* active?",
    getCorrectAnswer: async (artist) => { //find the correct answer for the current artist on dbpedia
        const activeYearStart = await dataFetcher.getPropertyDataDbpedia(artist.id, "dbo:activeYearsStartYear") //answer stands in one of these three properties
        const activeYearEnd = await dataFetcher.getPropertyDataDbpedia(artist.id, "dbo:activeYearsEndYear")
        const activeYears = await dataFetcher.getPropertyDataDbpedia(artist.id, "dbp:yearsActive")
        if (activeYearEnd.values.length == 0) { //if active year end is not exististing the artist is still active
            if (activeYearStart.values.length == 0) {
                return `From ${activeYears.values[0]} until Now` //use activeYears value only if active years start is not existing
            }
            return `From ${activeYearStart.values[0]} until Now`
        }
        return `From ${activeYearStart.values[0]} until ${activeYearEnd.values[0]}`
    },
    getWrongAnswers: async (current_artist, correct_answer) => {
        let possible_answers = []
        let artists_done = [current_artist]
        for (let i = 0; i < 3;) {
            const random_artist = helpers.getRandomArtistExceptDone(artists_done) //get a random artist which is has not already been used for this question
            const activeYearStart = await dataFetcher.getPropertyDataDbpedia(random_artist.id, "dbo:activeYearsStartYear") //same fuinctionality as above
            const activeYearEnd = await dataFetcher.getPropertyDataDbpedia(random_artist.id, "dbo:activeYearsEndYear")
            const activeYears = await dataFetcher.getPropertyDataDbpedia(random_artist.id, "dbp:yearsActive")
            let str = ""
            if (activeYearEnd.values.length == 0) {
                if (activeYearStart.values.length == 0) {
                    str = `From ${activeYears.values[0]} until Now`
                }
                else str = `From ${activeYearStart.values[0]} until Now`
            }
            else str = `From ${activeYearStart.values[0]} until ${activeYearEnd.values[0]}`
            artists_done.push(random_artist) //save that artist to save time and not fetch the same artist again
            if (possible_answers.includes(str) || correct_answer == str) { //check that the answer is not already existing from another artist
                continue
            }
            possible_answers.push(str)
            i++
        }
        return possible_answers
    }

}
const archivementsQuestion = { //constant for creating a question for how many awards the artist won
    question: "How many awards did *artist* win?",
    getCorrectAnswer: async (artist) => { //find the correct answer on wikidata
        const award_ids = await dataFetcher.getPropertyDataWikidata(artist.artistId, artist.awardId)
        return `${award_ids.values.length}`
    },
    getWrongAnswers: async (current_artist, correct_answer) => {
        let possible_answers = []
        let artists_done = [current_artist]
        for (let i = 0; i < 3;) {
            const random_artist = helpers.getRandomArtistExceptDone(artists_done)
            const award_ids = await dataFetcher.getPropertyDataWikidata(random_artist.artistId, random_artist.awardId)
            const str = `${award_ids.values.length}`
            artists_done.push(random_artist) //save that artist to save time and not fetch the same artist again
            if (possible_answers.includes(str) || correct_answer == str) { //check that the answer is not already existing from another artist
                continue
            }
            possible_answers.push(str)
            i++
        }
        return possible_answers
    }
}
const fromQuestion = { //constant for creating a question for where the artist is from
    question: "Where is *artist* from?",
    getCorrectAnswer: async (artist) => {
        let entity_link = await dataFetcher.getPropertyDataWikidata(artist.artistId, artist.from)
        const parts = entity_link.values[0].split('/')
        const entity_id = parts[parts.length - 1]
        const countries = await dataFetcher.getCountyNameWikidata(entity_id) //county is only saved by its id so fetch the name behind the id from wikidata
        return `${countries.values[0]}`
    },
    getWrongAnswers: async (_, correct_answer) => {
        let li = ["Germany", "Spain", "Mexico", "United Kingdom", "United States of America"]
        for (let i = 0; i  < li.length; i++) { // take 3 random answers from the most common countries
            if (correct_answer.includes(li[i])) { // do not include the correct answer in the list for possible wrong answers
                li.splice(i, 1)
            }
        }
        li.splice(Math.floor(Math.random() * li.length), 1);
        return li
    }
}
const songQuestion =  { //constant for creating a question for which song an artist created
    question: "Which song did *artist* create?",
    getCorrectAnswer: async (artist) => {
        const songname = await dataFetcher.getRandomSongFromArtistDbpedia(artist.id) //fetch a random song from the artist on dbpedia
        if (songname == "'undefined'") { // this should not happen but if it does, its possible to see which artist does not have a song in dbpedia. espacially good to have when a new artist is added
            console.error("songname undefined for ", random_artist)
        }
        return `${songname}`
    },
    getWrongAnswers: async (current_artist, correct_answer) => {
        let possible_answers = []
        let artists_done = [current_artist]
        for (let i = 0; i < 3;) {
            const random_artist = helpers.getRandomArtistExceptDone(artists_done)
            const songname = await dataFetcher.getRandomSongFromArtistDbpedia(random_artist.id)
            const str = `${songname}`
            if (songname == "'undefined'") { // this should not happen but if it does, its possible to see which artist does not have a song in dbpedia. espacially good to have when a new artist is added
                console.error("songname undefined for ", random_artist)
            }
            artists_done.push(random_artist) //save that artist to save time and not fetch the same artist again
            if (possible_answers.includes(str) || correct_answer == str) { //check that the answer is not already existing from another artist
                continue
            }
            possible_answers.push(str)
            i++
        }
        return possible_answers
    }
}
export const QUESTIONS = [activeQuestion, archivementsQuestion, fromQuestion, songQuestion] //export the constand QUESTIONS
// export const QUESTIONS = [songQuestion]