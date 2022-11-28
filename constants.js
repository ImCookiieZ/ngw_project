import ParsingClient from "sparql-http-client/ParsingClient.js";
import { getRandomArtistExceptDone } from "./helpers.js";


export const STANDARD_BORDER = "black"
export const STANDARD_BACKGROUND = "rgb(250,250,250)"
export const STANDARD_TEXT = "black"
export const ENDPOINT_URL_DBPEDIA = 'https://dbpedia.org/sparql'
export const ENDPOINT_URL_WIKIDATA = 'https://query.wikidata.org/sparql'

const getPropertyDataDbpedia = async (resource, property) => {
    let result = {
        property: property,
        values: []
    }
    const query = `SELECT ?object  WHERE { dbr:${resource} ${property} ?object . }`
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
    "country of citizenship" : "P27",
    "country of origin" : "P495"

}

const getRandomSongFromArtistDbpedia = async (artist_name) => {
    let songs = []
    const query = `SELECT ?subject  WHERE { ?subject dbo:artist dbr:${artist_name} . }`
        const client = new ParsingClient({ 
            endpointUrl: ENDPOINT_URL_DBPEDIA,  
            headers: {
                "Accept": "application/json", 
            "User-Agent": 'Next-Generation-Web-Group6/1.0 (stka22ac@student.ju.se) NGW-Project/1.0'
        }  
        })
        const bindings = await client.query.select(query)
        bindings.forEach(row => 
            Object.entries(row).forEach(([_, value]) => {
                songs.push(value.value)
        }))
        let random_songlink = songs[Math.floor(Math.random() * songs.length)]
        let parts = random_songlink.split('/')
        let link_songname = parts[parts.length - 1]
        link_songname = link_songname.replaceAll(",", "\\,").replaceAll("&", "\\&").replaceAll("(", "\\(").replaceAll(")", "\\)").replaceAll("'", "\\'").replaceAll('"', '\\"').replaceAll(".", "\\.").replaceAll("!", "\\!")
        let songname = await getPropertyDataDbpedia(link_songname, "dbp:name")
        if (songname.values.length == 0) {
            songname = await getPropertyDataDbpedia(link_songname, "foaf:name")
        }
        return `'${songname.values[0]}'`
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

const getCountyNameWikidata = async (entity_id) => {
    let result = {
        property: entity_id,
        values: []
    }
    const query = `SELECT ?object  WHERE { wd:${entity_id} wdt:P1448 ?object . }`
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

const activeQuestion = {
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

}
const archivementsQuestion = {
    question: "How many awards did *artist* win?",
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
}
const fromQuestion = {
    question: "Where is *artist* from?",
    getCorrectAnswer: async (artist_name) => {
        let entity_link = await getPropertyDataWikidata(artist_name, "country of citizenship")
        if (entity_link.values.length == 0) {
            entity_link = await getPropertyDataWikidata(artist_name, "country of origin")
        }
        const parts = entity_link.values[0].split('/')
        const entity_id = parts[parts.length - 1]
        const countries = await getCountyNameWikidata(entity_id)
        return `${countries.values[0]}`
    },
    getWrongAnswers: async (_, correct_answer) => {
        let li = ["Germany", "Spain", "Mexico", "United Kingdom", "United States of America"]
        li.splice(li.indexOf(correct_answer), 1);
        li.splice(Math.floor(Math.random() * li.length), 1);
        return li
    }
}
const songQuestion =  {
    question: "Which song did *artist* create?",
    getCorrectAnswer: async (artist_name) => {
        const songname = await getRandomSongFromArtistDbpedia(artist_name)
        return `${songname}`
    },
    getWrongAnswers: async (current_artist, correct_answer) => {
        let possible_answers = []
        let artists_done = [current_artist]
        for (let i = 0; i < 3;) {
            const random_artist = getRandomArtistExceptDone(artists_done)
            const songname = await getRandomSongFromArtistDbpedia(random_artist)
            const str = `${songname}`
            if (songname == undefined) {
                console.log(random_artist)
            }
            if (possible_answers.includes(str) || correct_answer == str) {
                continue
            }
            possible_answers.push(str)
            artists_done.push(random_artist)
            i++
        }
        return possible_answers
    }
}
export const QUESTIONS = [activeQuestion, archivementsQuestion, fromQuestion, songQuestion]