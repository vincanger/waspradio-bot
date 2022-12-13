const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('Skips the current song'),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return await interaction.editReply({ content: 'There is no music playing in this server!', ephemeral: true });
    const currentSong = queue.current;
    queue.skip(currentSong);
    await interaction.editReply({ embeds: [new EmbedBuilder().setDescription(`Skipped **${currentSong}**`)]});
  },
};
