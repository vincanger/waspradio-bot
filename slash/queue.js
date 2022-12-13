const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the queue')
    .addNumberOption((option) => option.setName('page').setDescription('The page number').setMinValue(1)),

  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return await interaction.editReply({ content: 'There is no music playing in this server!', ephemeral: true });
    const totalPages = Math.ceil(queue.tracks.length / 10);
    const page = (interaction.options.getNumber('page') || 1) - 1;
    if (page > totalPages)
      return await interaction.editReply({
        content: `There are only ${totalPages} pages in the queue!`,
        ephemeral: true,
      });

    const queueString = queue.tracks
      .slice(page * 10, (page + 1) * 10)
      .map((track, index) => `${index + 1 + page * 10}. [${track.title}](${track.url})`)
      .join('\n');
    const currentSong = queue.current;
    const embed = new EmbedBuilder()
      .setTitle('Server Queue')
      .setDescription(
        `Currently Playing: ` +
          (currentSong
            ? `${currentSong.duration} -- ${currentSong.title} -- ${currentSong.author}
                    \n\n**Queue**\n${queueString}`
            : '☹️ Nothing')
      )
      .setFooter({
        text: `Page ${page + 1} of ${totalPages} | ${queue.tracks.length} tracks`,
      })
      .setColor('BLUE')
      .setThumbnail(queue.thumbnail);

    await interaction.editReply({ embeds: [embed] });
  },
};
