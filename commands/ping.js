const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Ping bot to get the latency."),
    execute: ({client, interaction}) => {
        return client.utils.successEmbed(interaction, `Pong! Bot latency is ${Math.round(client.ws.ping)}ms`);
    }
}