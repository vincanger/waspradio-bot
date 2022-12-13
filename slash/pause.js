const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder().setName('pause').setDescription('Pause the music'),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return await interaction.editReply({ content: 'There is no music playing in this server!', ephemeral: true });
    queue.setPaused(true);
    await interaction.editReply({ content: 'Music has been paused! Use `/resume` to play the music.' });
  },
};
