import ParsingClient from "sparql-http-client/ParsingClient.js";
import { ENDPOINT_URL_DBPEDIA, ENDPOINT_URL_WIKIDATA } from "./constants.js";

const getPropertyDataDbpedia = async (resource, property) => { //get the data behind a dbpedia property on a resource
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
    bindings.forEach(row => //save needed results in result variable
        Object.entries(row).forEach(([_, value]) => {
            result.values.push(value.value)
        })
    )
    return result
}

const getRandomSongFromArtistDbpedia = async (artist_name) => { //get a random song from an artist of dbpedia
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
        bindings.forEach(row => //save needed results in result variable
            Object.entries(row).forEach(([_, value]) => {
                songs.push(value.value)
        }))
        let random_songlink = songs[Math.floor(Math.random() * songs.length)] // chose one random songlink
        let parts = random_songlink.split('/')
        let link_songname = parts[parts.length - 1] // only use the ending of the link which should be the ressource id
        link_songname = link_songname.replaceAll(",", "\\,").replaceAll("&", "\\&").replaceAll("(", "\\(").replaceAll(")", "\\)").replaceAll("'", "\\'").replaceAll('"', '\\"').replaceAll(".", "\\.").replaceAll("!", "\\!") //escape special SPARQL characters
        let songname = await getPropertyDataDbpedia(link_songname, "dbp:name")
        if (songname.values.length == 0) {
            songname = await getPropertyDataDbpedia(link_songname, "foaf:name")
        }
        if (songname.values.length == 0) { //this resource does not have a name or its stored in another property so repeat for another random song
            console.error("no info for:", link_songname, "from", artist_name)
            return await getRandomSongFromArtistDbpedia(artist_name)
        }
        return `'${songname.values[0]}'`
}

const getPropertyDataWikidata = async (artist_name, propertyId) => { //get the data behind a wikidata property on a resource
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
        bindings.forEach(row => //save needed results in result variable
            Object.entries(row).forEach(([_, value]) => {
            result.values.push(value.value)
        })
    )
    return result
}

const getCountyNameWikidata = async (entity_id) => { //get the name of a county id on wikidata
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
        bindings.forEach(row => //save needed results in result variable
            Object.entries(row).forEach(([_, value]) => {
            result.values.push(value.value)
        })
    )
    return result
}

export default {getCountyNameWikidata, getPropertyDataDbpedia, getRandomSongFromArtistDbpedia, getPropertyDataWikidata} //export the functions as a default object