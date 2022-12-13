const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quit')
    .setDescription('Stop the music and leave the voice channel'),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return await interaction.editReply({ content: 'There is no music playing in this server!', ephemeral: true });
    queue.destroy();
    await interaction.editReply({ content: 'Music stopped and left the voice channel!' });
  }
};

