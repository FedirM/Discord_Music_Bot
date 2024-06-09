const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear current player queue"),

    execute: async ({ client, interaction, queue }) => {
        if (queue.isEmpty()) return client.utils.errorEmbed(interaction, "The queue has no more track.");

        queue.tracks.clear();

        return client.utils.successEmbed(interaction, "Cleared the queue tracks.");
    }
}
