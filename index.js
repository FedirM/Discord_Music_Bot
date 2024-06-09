require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Collection,
    Events,
    REST,
    Routes
} = require('discord.js');
const { Player, useQueue} = require("discord-player");
const { YoutubeExtractor } = require("@discord-player/extractor");

const fs = require('fs');
const path = require('path');

process.isDevMode = () => {
    return process.env.MODE.toLowerCase() !== 'prod';
}

const NON_QUEUE_COMMANDS = ['play', 'ping'];

(async function () {
    try {
        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates
            ],
            closeTimeout: 5 * 60 * 1000, // min in ms
            waitGuildTimeout: 5 * 60 * 1000, // min in ms
        });

        // List of all commands
        const commands = [];
        client.commands = new Collection();

        // Utils
        client.utils = require('./utils');

        const commandsPath = path.join(__dirname, "commands");
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for(const file of commandFiles)
        {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if(process.isDevMode()) console.log('Reading ', command.data.name, ' command....');

            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }

        // Add the player on the client
        const player = new Player(client, {
            ytdlOptions: {
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            }
        });

        await player.extractors.register(YoutubeExtractor);
        await player.extractors.loadDefault();

        player.events.on('playerStart', (queue, track) => {
            // Emitted when the player starts to play a song
            queue.metadata.send(`Started playing: **${track.title}**`);
        });

        player.events.on('audioTrackAdd', (queue, track) => {
            // Emitted when the player adds a single song to its queue
            queue.metadata.send(`Track **${track.title}** queued`);
        });

        player.events.on('audioTracksAdd', (queue, track) => {
            // Emitted when the player adds multiple songs to its queue
            queue.metadata.send(`Multiple Track's queued`);
        });

        player.events.on('playerSkip', (queue, track) => {
            // Emitted when the audio player fails to load the stream for a song
            queue.metadata.send(`Skipping **${track.title}**!`);
        });

        player.events.on('disconnect', (queue) => {
            // Emitted when the bot leaves the voice channel
            queue.metadata.send('Looks like my job here is done, leaving now!');
        });
        player.events.on('emptyChannel', (queue) => {
            // Emitted when the voice channel has been empty for the set threshold
            // Bot will automatically leave the voice channel with this event
            queue.metadata.send(`Leaving because no vc activity for the past 5 minutes`);
        });
        player.events.on('emptyQueue', (queue) => {
            // Emitted when the player queue has finished
            queue.metadata.send('Queue finished!');
        });


        client.on(Events.ClientReady, () => {

            // Get all ids of the servers
            const guild_ids = client.guilds.cache.map(guild => guild.id);
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            const rest = new REST().setToken(process.env.TOKEN);
            for (const guildId of guild_ids)
            {
                rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),{body: commands})
                    .then(() => console.log('Successfully updated commands for guild ' + guildId))
                    .catch(console.error);
            }
        });

        client.on(Events.InteractionCreate, async interaction => {
            if(!interaction.isCommand()) return;

            const command = client.commands.get(interaction.commandName);
            if(!command) return;

            try
            {
                if(isCommandNeedsQueue(interaction.commandName)) {
                    console.log('command need queue');
                    let queue = (await getCurrentQueue(interaction)).queue;
                    if(!queue) return;
                    await command.execute({client, interaction, queue});
                } else {
                    await command.execute({client, interaction});
                }
            }
            catch(error)
            {
                console.error(error);
                await interaction.reply({content: "There was an error executing this command"});
            }
        });

        await client.login(process.env.TOKEN);
    } catch (e) {
        console.trace('Unknown error trace...');
        console.error("Unhandled error: ", e)
    }

}())

function isCommandNeedsQueue(cmd) {
    return !NON_QUEUE_COMMANDS.includes(cmd);
}

async function getCurrentQueue(interaction) {
    const { useQueue } = require("discord-player");
    const queue = useQueue(interaction.guild.id);

    const res = {
        queue: null,
        response: null
    };

    if (!queue) {
        res.response = await interaction.reply({
            content: "I’m currently not playing in this server.",
            ephemeral: true,
        });
        return res;
    }

    res.queue = queue;
    const memberChannelId = interaction.member?.voice?.channelId;
    const queueChannelId = queue?.channel.id;

    if (!memberChannelId)
        res.response = await interaction.reply({
            content: "You need to join a voice channel first!",
            ephemeral: true,
        });

    if (memberChannelId !== queueChannelId)
        res.response = await interaction.reply({
            content: "You must be in the same voice channel as me!",
            ephemeral: true,
        });


    return res;
}