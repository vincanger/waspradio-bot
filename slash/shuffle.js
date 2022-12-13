const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the queue'),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return await interaction.editReply({ content: 'There is no music playing in this server!', ephemeral: true });
    const success = queue.shuffle();
    await interaction.editReply({ content: success ? 'Queue shuffled!' : 'There was an error shuffling the queue!', ephemeral: true });
  }
};