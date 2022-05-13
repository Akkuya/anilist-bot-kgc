import { Client, Intents, MessageEmbed, Permissions, MessageActionRow, MessageButton, ButtonInteraction } from "discord.js";
import dotenv from 'dotenv';
import * as commands from './commands/index.js'
import path from "path";
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


const client = new Client(
    { 
        intents: intents 
    }
)


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity("r?help", {
        type: "PLAYING",
    });
    
})


client.on('messageCreate', async (message) => {
    let rawdata = fs.readFileSync('commands/channels.json');
    let channels = JSON.parse(rawdata).channels;
    for (let i = 0; i < channels.length; i++) {
        if (message.channel == channels[i]) { return }
    }
    if (!message.content.toLowerCase().startsWith('r?')) { return }
    if (message.author.bot) return

    let commandBody = message.content.slice(2)
    let args = commandBody.split(' ')
    let command = args.shift().toLowerCase()

    Object.keys(commands).forEach(mapcmd => {
        if (command === mapcmd) {
          commands[mapcmd]({
            client, message, args
          })
        }
    })
})      


client.login(process.env.TOKEN)