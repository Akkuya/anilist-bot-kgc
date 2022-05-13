import { MessageEmbed } from "discord.js";

export default async ({message}) => {
    const helpEmbed = new MessageEmbed()
            .setColor('#000000')
            .setTitle('Help Page')
            .setDescription('Command Usage. Prefix is a?.')
            .addFields({
                name: 'a?*<type>* *<query>*',
                value: 'Searches AniList. \nValid types are **anime (a)**, **manga (m)**, and **character (c)**. \nExample Usage: `a?anime oregairu`'
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
}