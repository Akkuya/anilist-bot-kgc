import fetch from 'node-fetch'
import { MessageEmbed } from "discord.js"


export default async({ client, message, args }) => {

    let query = args.join(" ")
    const request = `
        query ($search: String)  { # Define which variables will be used in the query (id)
            Page (page: 1, perPage: 10) {
                characters(search: $search) {
                    id
                    name {
                        full
                    }
                    image {
                        large
                    }
                    description
                    siteUrl
                    media (sort:POPULARITY_DESC) {
                        nodes {
                        title {
                          english
                          romaji
                          native
                        }
                      }
                    }
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

    function handleData(data) {
        let results = data.data.Page.characters[i]
        if (results.length == 1) {
            let nextChar = "No more results."
        } else {
            nextChar = data.data.Page.characters[i+1].name.full
        }
        console.log(results)
        let desc = results.description ?? "No description found."
        desc = desc.substring(0, 347) + '..'
        if (desc.search('!~') == -1 && desc.search('~!') == -1) {}
        else if (desc.search('!~') == -1 && desc.search('~!') != -1) {desc = desc + '||'}
        desc = desc.replace("~!", "||")
        desc = desc.replace("!~", "||")
    
        const embed = new MessageEmbed()
            .setColor("#000000")
            .setTitle(results.name.full)
            .setURL(results.siteUrl)
            .setDescription(desc)
            .addField('Show of Origin', results.media.nodes[0].title.english ?? results.media.nodes[0].title.romaji, true)
            .setImage(results.image.large)
            .setFooter(`Next result: ${nextChar}`)
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