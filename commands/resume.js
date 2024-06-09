const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resumes the current song"),
	execute: async ({ client, interaction, queue }) => {
		if (queue.node.isPlaying())
			return client.utils.wrongEmbed(interaction, "The playback is already playing.");

		queue.node.resume();

		return client.utils.successEmbed(interaction, "Resumed the playback.");
	},
}
