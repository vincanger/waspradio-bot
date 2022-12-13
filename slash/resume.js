const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder().setName('resume').setDescription('Resumes the music'),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);
    if (!queue)
      return await interaction.editReply({ content: 'There is no music queued in this server!', ephemeral: true });
    queue.setPaused(false);
    await interaction.editReply({ content: 'Music has been resumed! Use `/pause` to pause the music.' });
  },
};
