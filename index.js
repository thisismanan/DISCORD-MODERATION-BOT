const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});
client.login("BOT TOKEN");

// Logging when ready
client.on('ready', () => {
    console.log('🤖🤖 Bot is ready to login');
    console.log(`Logged in as ${client.user.tag}!`);
});

const Filter = require('bad-words');
const filter = new Filter();

client.on('messageCreate', async (message) => {
    // Check for profanity
    if (filter.isProfane(message.content)) {
        message.delete();
        message.channel.send(`${message.author.username}, you are not allowed to use that word.`);
    }

    // Check for image attachments
    if (message.attachments.size > 0) {
        const url = message.attachments.first().url;

        // Send the picture URL for review using the API
        try {
            const { data } = await axios.get('https://api.sightengine.com/1.0/check.json', {
                params: {
                    url: url,
                    models: 'nudity,wad,gore',
                    api_user: 'YOUR_USER',
                    api_secret: 'YOUR_SECRET'
                }
            });

            if (
                data.weapon > 0.01 ||
                data.alcohol > 0.1 ||
                data.gore.prob > 0.1 ||
                data.nudity.safe < 0.9
            ) {
                message.channel.send(`${message.author}, please do not post nudity or gore content.`);
                message.delete();
            }
        } catch (error) {
            console.error('Error checking image:', error);
        }
    }
});

