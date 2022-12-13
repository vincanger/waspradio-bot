const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear the queue'),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return await interaction.editReply({ content: 'There is no music playing in this server!', ephemeral: true });
    queue.clear();
    await interaction.editReply({ content: 'Queue cleared!' });
  }
};

