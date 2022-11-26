/*
A demo for how to query SPARQL endpoint using Javascript. The demo uses the library https://github.com/rubensworks/fetch-sparql-endpoint.js

He Tan, 2021-10-26
*/

import ParsingClient  from 'sparql-http-client/ParsingClient.js'

const endpointUrl = 'https://dbpedia.org/sparql'
// const query = `SELECT ?object  WHERE { dbr:Ed_Sheeran dbo:activeYearsEndYear ?object dbr:The_Beatles dbo:activeYearsEndYear ?object . }`
// const client = new ParsingClient({ 
//     endpointUrl,  
//     headers: {"Accept": "application/json"}  
// })
// client.query.select(query).then(bindings => {
//     console.log(bindings)
//     bindings.forEach(row => 
//     Object.entries(row).forEach(([key, value]) => {
//         console.log(`${key}: ${value.value} (${value.termType})`)
//     })
//     )
// })
// console.log(stream)
// stream.on('data', row => {
//   Object.entries(row).forEach(([key, value]) => {
//     console.log(`${key}: ${value.value} (${value.termType})`)
//   })
// })

// stream.on('error', err => {
//   console.error(err)
// })
// const artists = ["The_Beatles", "Ed_Sheeran", "Katy_Perry"]

// const getRandomArtistExceptDone = (current_artist) => {
//     const artist =artists[Math.floor(Math.random() * artists.length)];
//     if (artist == current_artist) {
//         return getRandomArtistExceptDone(current_artist)
//     }
//     return artist
// }
// for (let i = 0; i < 100; i++) {
//     console.log(getRandomArtistExceptDone("Ed_Sheeran"))
// }

// const getPropertyData = async (artist_name, property) => {
//     let result = {
//         property: property,
//         values: []
//     }
//     const query = `SELECT ?object  WHERE { dbr:${artist_name} ${property} ?object . }`
//     const client = new ParsingClient({ 
//         endpointUrl: endpointUrl,  
//         headers: {"Accept": "application/json"}  
//     })
//     const bindings = await client.query.select(query)
//     bindings.forEach(row => 
//         Object.entries(row).forEach(([_, value]) => {
//             result.values.push(value.value)
//         })
//     )
//     console.log(artist_name, result)
//     return result
// }

// console.log(getPropertyData("Katy_Perry", ))

const WikidataIds = {
    "Snoop_Dogg": "Q6096",
    "award received" : "P166"
}
export const ENDPOINT_URL_WIKIDATA = 'https://query.wikidata.org/sparql'

const test = async (artist_name, property) => {
    const query = `SELECT ?object  WHERE { wd:${WikidataIds[artist_name]} wdt:${WikidataIds[property]} ?object . }`
        const client = new ParsingClient({ 
            endpointUrl: ENDPOINT_URL_WIKIDATA,  
            headers: {"Accept": "application/json"}  
        })
        const bindings = await client.query.select(query)
        bindings.forEach(row => 
            Object.entries(row).forEach(([_, value]) => {
                console.log(value.value)
            })
        )
}
await test("Snoop_Dogg", "award received")
// console.log(WikidataIds["Snoop_Dogg"])