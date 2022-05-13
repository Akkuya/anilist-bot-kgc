import fs from 'fs'
import { Permissions } from 'discord.js'

export default async ({client, message, args}) => {
    let rawdata = fs.readFileSync('commands/channels.json');
    let channels = JSON.parse(rawdata).channels;
    if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) { message.reply(`You require the **Manage Channels** permission to do that.`); return }
    let removed = false;
    for (let i = 0; i<channels.length; i++) {
    if (channels[i] == args[0]) {
            fs.readFile("commands/channels.json", "utf8", function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    var obj = JSON.parse(data); //now converting it to an object
                    obj.channels.splice(i, 1) //adding the data
                    var json = JSON.stringify(obj, null, 2); //converting it back to json
                    fs.writeFile("commands/channels.json", json, "utf8", (err) => {
                        if (err) {
                            console.log(err);
                        } else {
                            message.reply(`Removed <#${args[0]}> to the list of ignored channels.`)
                        }
                    });
                }
            });
            removed = true
        }
    }
} 