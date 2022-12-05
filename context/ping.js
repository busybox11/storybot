const { ContextMenuCommandBuilder, ApplicationCommandType } = require(`discord.js`)

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName(`ping`)
        .setType(ApplicationCommandType.Message),

    async execute(client, interaction) {
        await interaction.reply('Pong!');
    }
}