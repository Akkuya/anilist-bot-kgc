import { Client, Intents, MessageEmbed, Permissions } from "discord.js";
import dotenv from 'dotenv';
import fs from 'fs'
import fetch from 'node-fetch';
dotenv.config()

const intents = new Intents
intents.add(
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES
)


const client = new Client({ intents: intents })


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
})


client.on('messageCreate', (message) => {
    if (!message.content.startsWith('r?')) { return }
    let rawdata = fs.readFileSync('channels.json');
    let channels = JSON.parse(rawdata).channels;
    for (let i = 0; i < channels.length; i++) {
        if (message.channel == channels[i]) { return }
    }
    const commandBody = message.content.slice(2)
    const args = commandBody.split(" ")
    const cmd = args.shift().toLowerCase()

    switch (cmd) {
        case 'search':
            const type = args.shift().toUpperCase()
            const q = args.join()
            search(q, type, message)

            break;
        case 'ignore':
            if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) { message.reply(`You require the **Manage Channels** permission to do that.`); return }
            fs.readFile("./channels.json", "utf8", function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    var obj = JSON.parse(data); //now converting it to an object
                    obj.channels.push(args[0]); //adding the data
                    var json = JSON.stringify(obj, null, 2); //converting it back to json
                    fs.writeFile("./channels.json", json, "utf8", (err) => {
                        if (err) {
                            console.log(err);
                        } else {

                        }
                    });
                }
            });
            message.reply(`Added <#${args[0]}> to the list of ignored channels.`)
            break
        case 'removeignore':
            if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) { message.reply(`You require the **Manage Channels** permission to do that.`); return }
            let removed = false;

            for (let i = 0; i < channels.length; i++) {
                if (channels[i] == args[0]) {
                    fs.readFile("./channels.json", "utf8", function readFileCallback(err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            var obj = JSON.parse(data); //now converting it to an object
                            obj.channels.splice(i, 1) //adding the data
                            var json = JSON.stringify(obj, null, 2); //converting it back to json
                            fs.writeFile("./channels.json", json, "utf8", (err) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("Done");
                                }
                            });
                        }
                    });
                    removed = true
                }
            }
            if (removed) {
                message.reply(`Removed <#${args[0]}> from the list of ignored channels!`)
            } else {
                message.reply("That channel wasn't found in the list of ignored channels.")
            }
            break;
        case 'ignorelist':
            let list = ""
            for (let i = 0; i < channels.length; i++) {
                list = list + `<#${channels[i]}>, `
            }
            message.reply(`Ignoring these channels: ${list}`)
            break
        case 'help':
            const helpEmbed = new MessageEmbed()
                .setColor('#000000')
                .setTitle('Help Page')
                .setDescription('Command Usage. Prefix is a?.')
                .addFields({
                    name: 'a?search *<type>* *<query>*',
                    value: 'Searches AniList. \nValid types are **anime**, **manga**, and **character**. \nExample Usage: `a?search anime oregairu`'
                }, {
                    name: 'a?ignore *<channelid>*',
                    value: 'Adds a channel to the list of channels the bot will ignore commands from.'
                }, {
                    name: 'a?ignoreremove *<channelid>*',
                    value: 'Removes a channel from the list of ignored channels.'
                }, {
                    name: 'a?ignorelist',
                    value: 'Lists all the channels that the bot ignores.'
                })


            message.reply({ embeds: [helpEmbed] });
            break
        default:
            break;
    }
})

const search = async(query, type, message) => {

    if (type === 'CHARACTER') {
        var request =
            `query ($pogg: String) { # Define which variables will be used in the query (id)
            Character (search: $pogg) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
                id
                name {
                    full
                }
                image {
                    large
                }
                description
                siteUrl
    
            }
        }`
        console.log('character')
    } else {
        var request = `
            query ($pogg: String) { # Define which variables will be used in the query (id)
                Media (search: $pogg, type: ${type}) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
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
                    episodes
                    chapters
                    status

                }
            }
        `;
    }


    // Define our query variables and values that will be used in the query request
    var variables = {
        pogg: query
    };
    // Define the config we'll need for our Api request
    var url = 'https://graphql.anilist.co',
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

    // Make the HTTP Api request
    fetch(url, options)
        .then(handleResponse)
        .then(handleData)
        .catch(() => {
            console.error
            message.reply('Not found.')
        })


    function handleResponse(response) {
        return response.json().then(function(json) {
            return response.ok ? json : Promise.reject(json);
        });
    }

    function handleData(data) {
        if (type != 'CHARACTER') {
            const results = data.data.Media
            let mediatype
            let mediatypeamount
            if (type == 'MANGA') {
                mediatype = "Chapters"
                mediatypeamount = results.chapters
            } else if (type == "ANIME") {
                mediatype = "Episodes"
                mediatypeamount = results.episodes
            }
            if (mediatypeamount == null) {
                mediatypeamount = 'Unknown'
            }
            let desc = results.description.substring(0, 347) + '..'
            const embed = new MessageEmbed()
                .setColor(results.coverImage.color)
                .setTitle(results.title.english)
                .setURL(`https://anilist.co/${type}/${results.id}`)
                .addFields({
                    name: 'Format',
                    value: `${results.format}`,
                    inline: true
                }, {
                    name: `${mediatype}`,
                    value: `${mediatypeamount}`,
                    inline: true
                }, {
                    name: 'Status',
                    value: `${results.status}`,
                    inline: true
                }, )
                .setDescription(desc)
                .setThumbnail(results.coverImage.extraLarge)
                .setImage(results.bannerImage)
            message.reply({ embeds: [embed] })
        } else {
            const results = data.data.Character
            let desc = results.description.substring(0, 347) + '..'
            const embed = new MessageEmbed()
                .setColor('#ffffff')
                .setTitle(results.name.full)
                .setURL(results.siteUrl)
                .setDescription(desc)
                .setImage(results.image.large)
                .setTimestamp()
            message.reply({ embeds: [embed] })
        }
    }



}
client.login(process.env.TOKEN)