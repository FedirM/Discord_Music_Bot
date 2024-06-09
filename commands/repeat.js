
const { QueueRepeatMode } = require("discord-player");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('repeat')
        .setDescription('Set repeat mode for the queue')
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Show current repeat mode status.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('off')
                .setDescription('Default mode with no loop active')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('queue')
                .setDescription('Loop the current queue')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('track')
                .setDescription('Repeat the current track')
        ),

    execute: async ({client, interaction, queue}) => {
        const subCmd = await interaction.options.getSubcommand(true);

        let description;
        switch (subCmd) {
            case "off":
                queue.setRepeatMode(QueueRepeatMode.OFF);
                description = "Turned off repeat mode.";
                break;
            case "track":
                queue.setRepeatMode(QueueRepeatMode.TRACK);
                description = "Looping the current track.";
                break;
            case "queue":
                queue.setRepeatMode(QueueRepeatMode.QUEUE);
                description = "Looing the current queue.";
                break;
            // case "show":
            default:
                let status = "none";
                if (queue.repeatMode === 2) {
                    status = "queue";
                } else if (queue.repeatMode === 1) {
                    status = "track";
                } else if (queue.repeatMode === 0) {
                    status = "off";
                }

                const embed = client.utils
                    .baseEmbed(interaction)
                    .setDescription(`Playback repeat status: \`${status}\`.`)
                    .setFooter({ text: `Use "/repeat <off|track|queue>" to change repeat mode.` });

                return interaction.reply({ ephemeral: true, embeds: [embed] }).catch(console.error);
        }

        return interaction.reply({
            embeds: [client.utils.baseEmbed(interaction).setDescription(description)],
        });
    }
}

