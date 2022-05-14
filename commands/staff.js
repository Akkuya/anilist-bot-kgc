import fetch from 'node-fetch'
import { MessageEmbed } from 'discord.js';
export default async({message, args}) => {
    let query = args.join(" ")
    const request = `
        query ($search: String) { # Define which variables will be used in the query (id)
           Page (page: 1, perPage: 20) {
            staff (search: $search) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
                name {
                    full
                    native
                }
                image {
                    large
                }
                description
                gender
                age
                siteUrl
                dateOfBirth {
                    day
                    month
                    year
                }
                primaryOccupations 
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

    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    let i = 0
    let noResults = 'No more results.'
    function handleData(data) {
        let results = data.data.Page.staff[i]
        console.log(results)
        let desc = results.description.substring(0, 700) + '..'
        if (desc.search('!~') == -1 && desc.search('~!') == -1) {}
        else if (desc.search('!~') == -1 && desc.search('~!') != -1) {desc = desc + '||'}
        desc = desc.replace("~!", "||")
        desc = desc.replace("!~", "||")
        let nextStaff
        if (data.data.Page.staff.length == 1 ) {
            nextStaff = "No more results."
        } else {
            nextStaff = data.data.Page.staff[i+1].name.full ?? data.data.Page.media[i+1].name.native
        }
        let day = results.dateOfBirth.day 
        let month = results.dateOfBirth.month
        let year = results.dateOfBirth.year 
        let birthdate
        if (!year) {
            birthdate = "No birthdate specified."
        }
        else {
            birthdate = `${day.toString()} ${months[month-1].toString()}, ${year}`
        }

        const embed = new MessageEmbed()
            .setColor("#000000")
            .setTitle(results.name.full ?? results.title.native)
            .setURL(results.siteUrl)
            .addFields({
                name: 'Age',
                value: `${results.age ?? "Age not specified."}`,
                inline: true
            }, {
                name: `Gender`,
                value: `${results.gender ?? "Gender not specified."}`,
                inline: true
            }, {
                name: 'Primary Occupations',
                value: `${results.primaryOccupations[0] ?? "Primary Occupations not specified."}`,
                inline: true
            }, {
                name: 'Birth Date',
                value: `${birthdate}`,
                inline: true
            })
            .setDescription(desc)
            .setImage(results.image.large)
            .setFooter(`Next result: ${nextStaff}`)
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