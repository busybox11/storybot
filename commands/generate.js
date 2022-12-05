const https = require('https');
const fs = require('fs');
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('generate')
		.setDescription('Generates a video with the specified duration in seconds')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('ID of the message that contains the picture to use'))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Target duration of the output video in seconds')),

	async execute(client, interaction) {
        interaction.deferReply();
        const channel = client.channels.cache.get(interaction.channelId)
        await channel.messages.fetch(interaction.options.getString('message_id'))
            .then(async (message) => {
                if (!fs.existsSync('generated')){
                    fs.mkdirSync('generated');
                }

                const file = fs.createWriteStream("generated/file.jpg");
                https.get(message.attachments.first().url, function(response) {
                    response.pipe(file);

                    // after download completed close filestream
                    file.on("finish", async () => {
                        file.close()
                        try {
                            await exec(`ffmpeg -y -r 30 -i generated/file.jpg -t 20 -c:v libx265 -x265-params lossless=1 -pix_fmt yuv420p -vf "scale=1080:1920,loop=-1:1" -movflags faststart generated/file.jpg.mp4`)
                            await interaction.followUp('Video generated')
                            
                            const attachment = new AttachmentBuilder('./generated/file.jpg.mp4', { name: 'output.mp4' })
                            await interaction.editReply({ files: [attachment] })
                            
                            const interactionMsgObj = await interaction.fetchReply()
                            await interaction.followUp(interactionMsgObj.attachments.first().url)
                        } catch (error) {
                            console.error(error)
                            await interaction.followUp(error.toString())
                        }
                    });
                });
            })
            .catch(console.error);
	},
}