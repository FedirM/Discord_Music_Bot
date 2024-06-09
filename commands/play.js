const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { QueryType, useMainPlayer, useQueue } = require("discord-player");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("play a song from YouTube.")
		.addSubcommand(subcommand =>
			subcommand
				.setName("search")
				.setDescription("Searches for a song and plays it")
				.addStringOption(option =>
					option.setName("search_term").setDescription("search keywords").setRequired(true)
				)
		)
        .addSubcommand(subcommand =>
			subcommand
				.setName("playlist")
				.setDescription("Plays a playlist from YT")
				.addStringOption(option => option.setName("url").setDescription("the playlist's url").setRequired(true))
		),
	execute: async ({client, interaction}) => {
        const player = useMainPlayer();
        const queue = useQueue(interaction.guild.id);
        const channel = interaction.member?.voice?.channel;

        if (!channel) return client.utils.wrongEmbed(interaction, "You have to join a voice channel first.");


        if (queue && queue.channel.id !== channel.id)
            return client.utils.wrongEmbed(interaction, "I'm already playing in a different voice channel!");

        if (!channel.viewable)
            return client.utils.wrongEmbed(interaction, "I need `View Channel` permission.");

        if (!channel.joinable)
            return client.utils.wrongEmbed(interaction, "I need `Connect Channel` permission.");

        if (channel.full)
            return client.utils.wrongEmbed(interaction, "Can't join, the voice channel is full.");

        if (interaction.member.voice.deaf)
            return client.utils.wrongEmbed(interaction, "You cannot run this command while deafened.");

        if (interaction.guild.members.me?.voice?.mute)
            return client.utils.wrongEmbed(interaction, "Please unmute me before playing.");


        switch (interaction.options.getSubcommand()) {
            case 'search': {
                const query = interaction.options.getString('search_term', true);

                if(process.isDevMode()) console.log('Query: ', query);

                if(!query) return client.utils.wrongEmbed(interaction, 'Wrong parameters!');
                const searchResult = await player
                    .search(query, { requestedBy: interaction.user })
                    .catch(() => null);

                if (!searchResult?.hasTracks())
                    return client.utils.wrongEmbed(interaction, `No track was found for ${query}!`);

                console.table(searchResult.tracks.map((t, i) => {
                    return {index: i, title: t.title, source: t.source}
                }))

                try {
                    let track = searchResult.tracks[0];

                    console.log('track to play: ', track.title + ` [FROM ${track.source}]`);
                    await player.play(channel, track,
                        Object.assign(require('../default-player-options'), {
                            nodeOptions: {
                                metadata: interaction.channel,
                            }
                        })
                    );

                    return client.utils.successEmbed(interaction, `Loading your track`);
                } catch (e) {
                    return client.utils.errorEmbed(interaction, `Something went wrong: ${e.message}`);
                }
            }

            case 'playlist': {
                const query = interaction.options.getString('url', true);

                if(process.isDevMode()) console.log('Query: ', query);

                if(!query) return client.utils.wrongEmbed(interaction, 'Wrong parameters!');
                const searchResult = await player
                    .search(query, { requestedBy: interaction.user })
                    .catch(() => null);

                if (!searchResult?.hasTracks())
                    return client.utils.wrongEmbed(interaction, `No track was found for ${query}!`);

                console.table(searchResult.tracks.map((t, i) => {
                    return {index: i, title: t.title, source: t.source}
                }))

                try {
                    let queue = useQueue(interaction.guild.id);

                    if (!queue) {
                        await player.play(channel, searchResult.tracks[0], {
                            nodeOptions: {
                                metadata: interaction.channel,
                            },
                        });

                        queue = useQueue(interaction.guild.id);
                        searchResult.tracks = searchResult.tracks.slice(1);
                    }

                    const memberChannelId = interaction.member?.voice?.channelId;
                    const queueChannelId = queue?.channel.id;

                    if (!memberChannelId)
                        return interaction.reply({
                            content: "You need to join a voice channel first!",
                            ephemeral: true,
                        });

                    if (memberChannelId !== queueChannelId)
                        return interaction.reply({
                            content: "You must be in the same voice channel as me!",
                            ephemeral: true,
                        });

                    queue.addTrack(searchResult.tracks);

                    console.log('Add playlist to the current queue');

                    return client.utils.successEmbed(interaction, `Playing your playlist`);
                } catch (e) {
                    return client.utils.errorEmbed(interaction, `Something went wrong: ${e.message}`);
                }
            }
        }
        
	}
}
