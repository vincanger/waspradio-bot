const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder().setName('skipto').setDescription('Skips to certain track number')
    .addNumberOption(option => option.setName('tracknumber').setDescription('Track number to skip to').setMinValue(1).setRequired(true)),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);
    if (!queue)
      return await interaction.editReply({ content: 'There is no music queued in this server!', ephemeral: true });
    const trackNum = interaction.options.getNumber('tracknumber');
    if (trackNum > queue.tracks.length) return await interaction.editReply({ content: 'There are not that many tracks in the queue!', ephemeral: true });

    queue.skipTo(trackNum - 1);
    await interaction.editReply({ content: 'Skipped to track number ' + trackNum });
  },
};
