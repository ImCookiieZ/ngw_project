import ParsingClient from "sparql-http-client/ParsingClient.js";
import { getRandomArtistExceptDone } from "./helpers.js";

const getPropertyData = async (artist_name, property) => {
    let result = {
        property: property,
        values: []
    }
    const query = `SELECT ?object  WHERE { dbr:${artist_name} ${property} ?object . }`
    const client = new ParsingClient({ 
        endpointUrl: ENDPOINT_URL,  
        headers: {"Accept": "application/json"}  
    })
    const bindings = await client.query.select(query)
    bindings.forEach(row => 
        Object.entries(row).forEach(([_, value]) => {
            result.values.push(value.value)
        })
    )
    return result
}

export const STANDARD_BORDER = "black"
export const STANDARD_BACKGROUND = "rgb(250,250,250)"
export const STANDARD_TEXT = "black"
export const ENDPOINT_URL = 'https://dbpedia.org/sparql'

export const ARTISTS = {
    rock: ["The_Beatles", "David_Bowie"],
    alternative: ["Green_Day", "Linkin_Park"],
    pop: ["Ed_Sheeran", "Katy_Perry"],
    rap: ["Eminem", "Snoop_Dogg"],
    all: ["The_Beatles", "Ed_Sheeran", "Katy_Perry", "David_Bowie", "Green_Day", "Linkin_Park", "Eminem", "Snoop_Dogg"]
}

export const QUESTIONS = [{
    question: "When was *artist* active?",
    getCorrectAnswer: async (artist_name) => {
        const activeYearStart = await getPropertyData(artist_name, "dbo:activeYearsStartYear")
        const activeYearEnd = await getPropertyData(artist_name, "dbo:activeYearsEndYear")
        const activeYears = await getPropertyData(artist_name, "dbp:yearsActive")
        if (activeYearEnd.values.length == 0) {
            if (activeYearStart.values.length == 0) {
                return `From ${activeYears.values[0]} until Now`
            }
            return `From ${activeYearStart.values[0]} until Now`
        }
        return `From ${activeYearStart.values[0]} until ${activeYearEnd.values[0]}`
    },
    getWrongAnswers: async (current_artist, correct_answer) => {
        let possible_answers = []
        let artists_done = [current_artist]
        for (let i = 0; i < 3;) {
            const random_artist = getRandomArtistExceptDone(artists_done)
            const activeYearStart = await getPropertyData(random_artist, "dbo:activeYearsStartYear")
            const activeYearEnd = await getPropertyData(random_artist, "dbo:activeYearsEndYear")
            const activeYears = await getPropertyData(current_artist, "dbp:yearsActive")
            let str = ""
            if (activeYearEnd.values.length == 0) {
                if (activeYearStart.values.length == 0) {
                    str = `From ${activeYears.values[0]} until Now`
                }
                else str = `From ${activeYearStart.values[0]} until Now`
            }
            else str = `From ${activeYearStart.values[0]} until ${activeYearEnd.values[0]}`
            if (possible_answers.includes(str) || correct_answer == str) {
                continue
            }
            possible_answers.push(str)
            artists_done.push(random_artist)
            i++
        }
        return possible_answers
    }

}]