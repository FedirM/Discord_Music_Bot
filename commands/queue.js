const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("shows first 10 songs in the queue")
        .addNumberOption(option => option.setName('page').setDescription("page counter").setRequired(false)),

    execute: async ({ client, interaction, queue }) => {
        if (!queue.size) return client.utils.wrongEmbed(interaction, "There is no track in the queue.");

        let page = interaction.options.getNumber("page", false) ?? 1;

        const multiple = 10;

        const maxPages = Math.ceil(queue.size / multiple);

        if (page < 1 || page > maxPages) page = 1;

        const end = page * multiple;
        const start = end - multiple;

        const tracks = queue.tracks.toArray().slice(start, end);

        const embed = client.utils
            .baseEmbed(interaction)
            .setDescription(
                `${tracks
                    .map(
                        (track, i) =>
                            `${start + ++i} - [${track.title}](${track.url}) ~ [${track.requestedBy.toString()}]`
                    )
                    .join("\n")}`
            )
            .setFooter({
                text: `Page ${page} of ${maxPages} | track ${start + 1} to ${
                    end > queue.size ? `${queue.size}` : `${end}`
                } of ${queue.size}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            });

        return interaction.reply({ ephemeral: true, embeds: [embed] }).catch(console.error);
    }
}
