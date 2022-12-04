import ParsingClient from "sparql-http-client/ParsingClient.js";
import helpers from "./helpers.js";


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
        if (songname.values.length == 0) {
            console.log(link_songname)
            console.log(artist_name)
            return await getRandomSongFromArtistDbpedia(artist_name)
        }
        return `'${songname.values[0]}'`
}

const getPropertyDataWikidata = async (artist_name, propertyId) => {
    let result = {
        property: propertyId,
        values: []
    }
    const query = `SELECT ?object  WHERE { wd:${artist_name} wdt:${propertyId} ?object . }`
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
    getCorrectAnswer: async (artist) => {
        const activeYearStart = await getPropertyDataDbpedia(artist.id, "dbo:activeYearsStartYear")
        const activeYearEnd = await getPropertyDataDbpedia(artist.id, "dbo:activeYearsEndYear")
        const activeYears = await getPropertyDataDbpedia(artist.id, "dbp:yearsActive")
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
            const random_artist = helpers.getRandomArtistExceptDone(artists_done)
            const activeYearStart = await getPropertyDataDbpedia(random_artist.id, "dbo:activeYearsStartYear")
            const activeYearEnd = await getPropertyDataDbpedia(random_artist.id, "dbo:activeYearsEndYear")
            const activeYears = await getPropertyDataDbpedia(current_artist.id, "dbp:yearsActive")
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
    getCorrectAnswer: async (artist) => {
        const award_ids = await getPropertyDataWikidata(artist.artistId, artist.awardId)
        return `${award_ids.values.length}`
    },
    getWrongAnswers: async (current_artist, correct_answer) => {
        let possible_answers = []
        let artists_done = [current_artist]
        for (let i = 0; i < 3;) {
            const random_artist = helpers.getRandomArtistExceptDone(artists_done)
            const award_ids = await getPropertyDataWikidata(random_artist.artistId, random_artist.awardId)
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
    getCorrectAnswer: async (artist) => {
        let entity_link = await getPropertyDataWikidata(artist.artistId, artist.from)
        const parts = entity_link.values[0].split('/')
        const entity_id = parts[parts.length - 1]
        const countries = await getCountyNameWikidata(entity_id)
        return `${countries.values[0]}`
    },
    getWrongAnswers: async (_, correct_answer) => {
        let li = ["Germany", "Spain", "Mexico", "United Kingdom", "United States of America"]
        for (let i = 0; i  < li.length; i++) {
            if (correct_answer.includes(li[i])) {
                li.splice(i, 1)
            }
        }
        li.splice(Math.floor(Math.random() * li.length), 1);
        return li
    }
}
const songQuestion =  {
    question: "Which song did *artist* create?",
    getCorrectAnswer: async (artist) => {
        const songname = await getRandomSongFromArtistDbpedia(artist.id)
        if (songname == "'undefined'") {
            console.log(random_artist)
        }
        return `${songname}`
    },
    getWrongAnswers: async (current_artist, correct_answer) => {
        let possible_answers = []
        let artists_done = [current_artist]
        for (let i = 0; i < 3;) {
            const random_artist = helpers.getRandomArtistExceptDone(artists_done)
            const songname = await getRandomSongFromArtistDbpedia(random_artist.id)
            const str = `${songname}`
            if (songname == "'undefined'") {
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
// export const QUESTIONS = [songQuestion]