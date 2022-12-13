const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a playlist from YouTube')
    .addStringOption((option) => option.setName('style').setDescription('Ambient, LoFi').setRequired(true)),
  run: async ({ client, interaction }) => {
    if (!interaction.member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel to use this command!', ephemeral: true });
    const queue = client.player.createQueue(interaction.guildId);
    if (!queue.connection) await queue.connect(interaction.member.voice.channel);

    let embed = new EmbedBuilder()

    if (queue.connection) {
      const style = interaction.options.getString('style');
      let url;
      switch (style.toLowerCase()) {
        case 'ambient':
          url = 'https://youtube.com/playlist?list=PLpJu0Lz54ojEFFiOVfVLOC3w4YGrQhZ_g';
          break;
        case 'lofi':
          url = 'https://youtube.com/playlist?list=PLpJu0Lz54ojFdr6K-oGmSDGrzAlkQ8-Kb';
          break;
        default:
          url = 'https://www.youtube.com/playlist?list=PL3Vb7c7onGS1B54VlXhi16EmMVmAw2eiI';
          break;
      }
      const searchResult = await client.player
        .search(url, {
          requestedBy: interaction.user,
          searchEngine: QueryType.YOUTUBE_PLAYLIST,
        })
        .catch((err) => {
          console.error(err);
        });
      if (!searchResult || !searchResult.playlist) return interaction.reply({ content: 'No video was found with the provided url!', ephemeral: true });
      queue.clear();
      queue.addTracks(searchResult.tracks);
      embed
        .setDescription(
          `**${searchResult.tracks.length} songs from [${searchResult.playlist.title}](${searchResult.playlist.url})** have been added to the Queue`
        )
        .setThumbnail(searchResult.playlist.thumbnail.url);
      // return interaction.reply({ embeds: [embed] });
    }
    if (!queue.playing) await queue.play();
    await interaction.editReply({ embeds: [embed] });
  },
};
