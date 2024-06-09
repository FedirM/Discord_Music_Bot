const { useHistory } = require('discord-player');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("back")
        .setDescription("Skips the current song"),

    execute: async ({ client, interaction, queue }) => {
        const history = useHistory(interaction.guildId);

        if (history.isEmpty())
            return client.utils.errorEmbed(interaction, "The queue has no history track.");

        await history.previous();

        return client.utils.successEmbed(interaction, "Backed the history track.");
    },
}