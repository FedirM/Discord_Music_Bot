// eslint-disable-next-line no-unused-vars
const { EmbedBuilder, CommandInteraction, Colors } = require("discord.js");

/**
 * reply a embedded success message to interaction
 * @param {CommandInteraction} interaction
 * @param {string} text
 * @param {boolean} [ephemeral=false]
 */
function successEmbed(interaction, text, ephemeral = false) {
    if (!interaction) {
        throw Error("'interaction' must be passed down as param! (successEmbed)");
    }

    if (!text) {
        throw Error("'text' must be passed down as param! (successEmbed)");
    }

    const sEmbed = new EmbedBuilder()
        .setDescription(text)
        .setColor(interaction.guild.members.me.displayColor || Colors.Fuchsia);

    if (interaction.deferred) {
        return interaction
            .editReply({ embeds: [sEmbed] })
            .catch((e) => {
            console.error('[successEmbed] error: ', e.message);
        });
    }

    if (interaction.replied) {
        return interaction
            .followUp({ ephemeral, embeds: [sEmbed] })
            .catch((e) => {
            console.error('[successEmbed] error: ', e.message);
        });
    }

    return interaction
        .reply({ ephemeral, embeds: [sEmbed] })
        .catch((e) => {
        console.error('[successEmbed] error: ', e.message);
    });
}

/**
 * reply a orange embedded wrong message to interaction
 * @param {CommandInteraction} interaction
 * @param {string} text
 */
function wrongEmbed(interaction, text) {
    if (!interaction) {
        throw Error("'interaction' must be passed down as param! (wrongEmbed)");
    }

    if (!text) {
        throw Error("'text' must be passed down as param! (wrongEmbed)");
    }

    const wEmbed = new EmbedBuilder().setDescription(text).setColor(Colors.Orange);

    if (interaction.deferred) {
        return interaction.editReply({ embeds: [wEmbed] }).catch(console.error);
    }

    if (interaction.replied) {
        return interaction.followUp({ ephemeral: true, embeds: [wEmbed] }).catch(console.error);
    }

    return interaction.reply({ ephemeral: true, embeds: [wEmbed] }).catch(console.error);
}

/**
 * reply a red embedded error message to interaction
 * @param {CommandInteraction} interaction
 * @param {string} text
 */
function errorEmbed(interaction, text) {
    if (!interaction) {
        throw Error("'interaction' must be passed down as param! (errorEmbed)");
    }

    if (!text) {
        throw Error("'text' must be passed down as param! (errorEmbed)");
    }

    const eEmbed = new EmbedBuilder().setDescription(text).setColor(Colors.Red);

    if (interaction.deferred) {
        return interaction.editReply({ embeds: [eEmbed] }).catch(console.error);
    }

    if (interaction.replied) {
        return interaction.followUp({ ephemeral: true, embeds: [eEmbed] }).catch(console.error);
    }

    return interaction.reply({ ephemeral: true, embeds: [eEmbed] }).catch(console.error);
}

/**
 * send a custom embed to queue textChannel
 * @param {import("discord-player").GuildQueue} queue
 * @param {string} text - description text
 */
async function queueEmbed(queue, text) {
    if (!queue) {
        throw Error("'queue' must be passed down as param! (queueEmbed)");
    }

    if (!text) {
        throw Error("'text' must be passed down as param! (queueEmbed)");
    }

    const channel = queue.metadata;
    const { havePermissions } = require("./utils");
    if (!havePermissions(channel)) return;

    const embedQ = new EmbedBuilder()
        .setDescription(text)
        .setColor(queue.guild.members.me.displayColor || Colors.Fuchsia);

    return channel.send({ embeds: [embedQ] });
}

/**
 * returns a custom embed with colour
 * @param {DJS.CommandInteraction|string|object|null} resolvable
 */
function baseEmbed(resolvable) {
    let colour = Colors.Fuchsia;

    if (resolvable && typeof resolvable === "number") colour = resolvable;
    if (resolvable && typeof resolvable === "object")
        colour =
            ("guild" in resolvable ? resolvable.guild : resolvable)?.members.me.displayColor ||
            Colors.Fuchsia;

    return new EmbedBuilder().setColor(colour);
}

module.exports = {
    errorEmbed,
    wrongEmbed,
    successEmbed,
    queueEmbed,
    baseEmbed
};
