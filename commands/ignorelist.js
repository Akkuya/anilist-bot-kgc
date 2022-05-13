import fs from 'fs'

export default async ({message}) => {
    let rawdata = fs.readFileSync('commands/channels.json');
    let channels = JSON.parse(rawdata).channels;
    let list = ""
        for (let i = 0; i < channels.length; i++) {
            list = list + `<#${channels[i]}>, `
        }
    message.reply(`Ignoring these channels: ${list}`)

}