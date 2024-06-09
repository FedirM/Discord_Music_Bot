const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skips the current song"),

	execute: async ({ client, interaction, queue }) => {

        if (queue.size < 1 && queue.repeatMode !== 3)
            return client.utils.errorEmbed(interaction, "The queue has no more track.");

        queue.node.skip();

        return client.utils.successEmbed(interaction, "Skipped the current track.");
	},
}
