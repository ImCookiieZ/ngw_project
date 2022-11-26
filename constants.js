import ParsingClient from "sparql-http-client/ParsingClient.js";
import { getRandomArtistExceptDone } from "./helpers.js";


export const STANDARD_BORDER = "black"
export const STANDARD_BACKGROUND = "rgb(250,250,250)"
export const STANDARD_TEXT = "black"
export const ENDPOINT_URL_DBPEDIA = 'https://dbpedia.org/sparql'
export const ENDPOINT_URL_WIKIDATA = 'https://query.wikidata.org/sparql'

const getPropertyDataDbpedia = async (artist_name, property) => {
    let result = {
        property: property,
        values: []
    }
    const query = `SELECT ?object  WHERE { dbr:${artist_name} ${property} ?object . }`
    const client = new ParsingClient({ 
        endpointUrl: ENDPOINT_URL_DBPEDIA,  
        headers: {
            "Accept": "application/json",
            "User-Agent": 'Next-Generation-Web-Group6/1.0 (stka22ac@student.ju.se) NGW-Project/1.0'}  
    })
    const bindings = await client.query.select(query)
    bindings.forEach(row => 
        Object.entries(row).forEach(([_, value]) => {
            result.values.push(value.value)
        })
    )
    return result
}
export const ARTISTS = {
    rock: ["The_Beatles", "David_Bowie"],
    alternative: ["Green_Day", "Linkin_Park"],
    pop: ["Ed_Sheeran", "Katy_Perry"],
    rap: ["Eminem", "Snoop_Dogg"],
    all: ["The_Beatles", "Ed_Sheeran", "Katy_Perry", "David_Bowie", "Green_Day", "Linkin_Park", "Eminem", "Snoop_Dogg"]
}

const WikidataIds = {
    //artists
    "The_Beatles" : "Q1299",
    "David_Bowie" : "Q5383",
    "Green_Day" : "Q47871",
    "Linkin_Park" : "Q261",
    "Ed_Sheeran" : "Q47447",
    "Katy_Perry" : "Q42493",
    "Eminem" : "Q5608",
    "Snoop_Dogg": "Q6096",
    //properties
    "award received" : "P166",

}

const getPropertyDataWikidata = async (artist_name, property) => {
    let result = {
        property: property,
        values: []
    }
    const query = `SELECT ?object  WHERE { wd:${WikidataIds[artist_name]} wdt:${WikidataIds[property]} ?object . }`
        const client = new ParsingClient({ 
            endpointUrl: ENDPOINT_URL_WIKIDATA,  
            headers: {
                "Accept": "application/json", 
            "User-Agent": 'Next-Generation-Web-Group6/1.0 (stka22ac@student.ju.se) NGW-Project/1.0'
        }  
        })
        const bindings = await client.query.select(query)
        bindings.forEach(row => 
            Object.entries(row).forEach(([_, value]) => {
            result.values.push(value.value)
        })
    )
    return result
}



export const QUESTIONS = [{
    question: "When was *artist* active?",
    getCorrectAnswer: async (artist_name) => {
        const activeYearStart = await getPropertyDataDbpedia(artist_name, "dbo:activeYearsStartYear")
        const activeYearEnd = await getPropertyDataDbpedia(artist_name, "dbo:activeYearsEndYear")
        const activeYears = await getPropertyDataDbpedia(artist_name, "dbp:yearsActive")
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
            const activeYearStart = await getPropertyDataDbpedia(random_artist, "dbo:activeYearsStartYear")
            const activeYearEnd = await getPropertyDataDbpedia(random_artist, "dbo:activeYearsEndYear")
            const activeYears = await getPropertyDataDbpedia(current_artist, "dbp:yearsActive")
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

}, {
    question: "How many awards had *artist* got?",
    getCorrectAnswer: async (artist_name) => {
        const award_ids = await getPropertyDataWikidata(artist_name, "award received")
        return `${award_ids.values.length}`
    },
    getWrongAnswers: async (current_artist, correct_answer) => {
        let possible_answers = []
        let artists_done = [current_artist]
        for (let i = 0; i < 3;) {
            const random_artist = getRandomArtistExceptDone(artists_done)
            const award_ids = await getPropertyDataWikidata(random_artist, "award received")
            const str = `${award_ids.values.length}`
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