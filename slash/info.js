const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Show the current song'),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return await interaction.editReply({ content: 'There is no music playing in this server!', ephemeral: true });

    let bar = queue.createProgressBar({
      queue: true,
      length: 19,
    });

    const song = queue.current;

    const embed = new EmbedBuilder()
      .setDescription(`**[${song.title} -- ${song.author}](${song.url}) -- ${song.duration}** \n ${bar}`)
      .setThumbnail(song.thumbnail);

    await interaction.editReply({ embeds: [embed] });
  },
};
