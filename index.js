require('dotenv').config()
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js')

// Create a new client instance
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
] })

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`)
})

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const contextPath = path.join(__dirname, 'context');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const contextFiles = fs.readdirSync(contextPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

for (const file of contextFiles) {
	const filePath = path.join(contextPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.on(Events.InteractionCreate, async interaction => {
	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(client, interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Log in to Discord with your client's token
client.login(process.env.BOT_TOKEN)
