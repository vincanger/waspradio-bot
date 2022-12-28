const Discord = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { Player } = require('discord-player');
const { joinVoiceChannel } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const { QueryType } = require('discord-player');
const { join } = require('path');

const TOKEN = process.env.TOKEN;
const LOAD_SLASH = process.argv[2] == 'load';
console.log(process.argv);

const CLIENT_ID = '1052200902376837171';
const GUILD_ID = '686873244791210014'; 
const CHANNEL_ID =  '1052267139437961257'; 
// use the below values for testing in the dev server
// const GUILD_ID = '839900449648935024'; 
// const CHANNEL_ID =  '839900450110963745';

const client = new Discord.Client({
  intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildVoiceStates],
});

client.slashcommands = new Discord.Collection();
client.player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
  },
});

let commands = [];

const slashFiles = fs.readdirSync('./slash').filter((file) => file.endsWith('.js'));
for (const file of slashFiles) {
  const slashcmd = require(`./slash/${file}`);
  console.log(`Loaded slash command ${slashcmd.data.name}`);
  client.slashcommands.set(slashcmd.data.name, slashcmd);
  if (LOAD_SLASH) {
    commands.push(slashcmd.data.toJSON());
  }
}

if (LOAD_SLASH) {
  const rest = new REST({ version: '9' }).setToken(TOKEN);
  console.log('Deploying slash commands');
  rest
    .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
    .then(() => {
      console.log('Successfully loaded');
      process.exit(0);
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
    });
} else {
  client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
  });
  client.on('interactionCreate', (interaction) => {
    async function handleCommand() {
      if (!interaction.isCommand()) return;

      const slashcmd = client.slashcommands.get(interaction.commandName);
      if (!slashcmd) interaction.reply('Not a valid slash command');

      await interaction.deferReply();
      await slashcmd.run({ client, interaction });
    }
    handleCommand();
  });
  client.on('voiceStateUpdate', async (oldState, newState) => {
    // check if the update comes from the bot itself
    if (newState.id === CLIENT_ID) {
      console.log('newstate id', newState.id)
      return;
    }
    
    let queue = client.player.getQueue(GUILD_ID);
    const channel = client.channels.cache.get(CHANNEL_ID);
    const currentListeners = channel.members.size;

    if (currentListeners >= 1) {
      if (queue?.playing) {
        console.log('queue already playing -- skipping setup');
        return;
      }
      console.log('queue not playing -- setting up initial queue');
      if (oldState.channelId === null && newState.channelId !== null) {
        if (!channel) return;
        // Send the message, mentioning the member
        if (newState.id !== CLIENT_ID) channel.send(`${newState.member} Hi. Use the \`/\` to control the music!`);
      }

      queue = client.player.createQueue(GUILD_ID);
      if (!queue.connection) await queue.connect(CHANNEL_ID);
      const searchResult = await client.player
        .search('https://youtube.com/playlist?list=PLpJu0Lz54ojEmTgM-8daNcg5udcFg0oNr', {
          searchEngine: QueryType.YOUTUBE_PLAYLIST,
        })
        .catch((err) => {
          console.error(err);
        });
      if (!searchResult || !searchResult.playlist) channel.send('Nothing was found with the provided url!');

      queue.addTracks(searchResult.tracks);
      let embed = new EmbedBuilder();
      embed
        .setDescription(
          `**${searchResult.tracks.length} songs from [${searchResult.playlist.title}](${searchResult.playlist.url})** have been added to the Queue`
        )
        .setThumbnail(searchResult.playlist.thumbnail.url);

      if (!queue.playing) await queue.play();
    }
  });

  client.login(TOKEN);
}
