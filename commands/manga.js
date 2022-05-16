import fetch from 'node-fetch'
import { MessageEmbed } from "discord.js"


export default async({ client, message, args }) => {

    let query = args.join(" ")
    const request = `
        query ($search: String) { # Define which variables will be used in the query (id)
           Page (page: 1, perPage: 20) {
            media (search: $search, type: MANGA, sort: SEARCH_MATCH) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
                id
                title {
                    romaji
                    english
                    native
                }
                description
                bannerImage
                coverImage {
                    extraLarge
                    large
                    medium
                    color
                }
                format
                chapters
                status
                siteUrl
            }
           }
        }
    `;
    let variables = {
        search: query
    };
    // Define the config we'll need for our Api request



    let url = 'https://graphql.anilist.co',
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: request,
                variables: variables
            })
        };
    

    function handleResponse(response) {
        return response.json().then(function(json) {
            return response.ok ? json : Promise.reject(json);
        });
    }


    let i = 0
    let noResults = 'No more results.'
    function handleData(data) {
        let results = data.data.Page.media[i]
        let nextManga
        if (data.data.Page.media.length == 1 ) {
            nextManga = "No more results."
        } else {
            nextManga = data.data.Page.media[i+1].title.english ?? data.data.Page.media[i+1].title.romaji
        }
        console.log(results)
        let desc = results.description.substring(0, 347) + '..'
        for (let i = 0; i<10; i++) {
            desc = desc.replace('<i>', "*")
            desc = desc.replace('</i>', "*")
            desc = desc.replace('<br>', "\n")
            desc = desc.replace('<br>', "\n")
        }
        const embed = new MessageEmbed()
            .setColor(results.coverImage.color)
            .setTitle(results.title.english ?? results.title.romaji)
            .setURL(results.siteUrl)
            .addFields({
                name: 'Format',
                value: `${results.format}`,
                inline: true
            }, {
                name: `Chapters`,
                value: `${results.chapters ?? "Unknown"}`,
                inline: true
            }, {
                name: 'Status',
                value: `${results.status}`,
                inline: true
            }, )
            .setDescription(desc)
            .setThumbnail(results.coverImage.extraLarge)
            .setImage(results.bannerImage)
            .setFooter(`Next result: ${nextManga}`)
        if (message) {
            message.reply({
                embeds: [embed]
            })
            return
        }
    }

    function handleError(error) {
        message.reply('Not found/Error Occurred')
        console.error(error);
    }

    // Alternatively we can just simply return our reply object
    // OR just a string as the content.
    // WOKCommands will handle the proper way to reply with it 
    fetch(url, options).then(handleResponse)
        .then(handleData)
        .catch(handleError);
}