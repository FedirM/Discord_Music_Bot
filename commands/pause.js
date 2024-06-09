const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pauses the current song"),
	execute: async ({ client, interaction, queue }) => {
		if (queue.node.isPaused())
			return client.utils.wrongEmbed(interaction, "The playback is already paused.");

		queue.node.pause();

		return client.utils.successEmbed(interaction, "Paused the playback.");
	},
}
