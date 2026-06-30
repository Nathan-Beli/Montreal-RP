require('dotenv').config();
const { Client, GatewayIntentBits, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const express = require('express');

// Serveur santé pour éviter le "Health Check Failed"
const app = express();
app.get('/', (req, res) => res.send('En ligne'));
app.listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async (c) => {
    console.log(`Connecté : ${c.user.tag}`);
    
    // Enregistrement de la commande
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(c.user.id), {
        body: [new SlashCommandBuilder().setName('audiance').setDescription('Ouvre le formulaire')]
    });
});

client.on(Events.InteractionCreate, async interaction => {
    // 1. Commande Slash
    if (interaction.isChatInputCommand() && interaction.commandName === 'audiance') {
        const modal = new ModalBuilder().setCustomId('modal_audiance').setTitle('Convocation à la Cour');
        
        const fields = [
            ['demandeur', 'Demandeur (@Nom)'], ['defendeur', 'Défendeur (@Nom)'],
            ['faits', 'Nature des faits'], ['date', 'Date (JJ/MM/AAAA)'],
            ['heure', 'Heure (HH:MM)'], ['lieu', 'Lieu']
        ];

        modal.addComponents(fields.map(f => new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId(f[0]).setLabel(f[1]).setStyle(TextInputStyle.Short).setRequired(true)
        )));

        return interaction.showModal(modal); // Réponse immédiate au serveur Discord
    }

    // 2. Soumission du formulaire
    if (interaction.isModalSubmit() && interaction.customId === 'modal_audiance') {
        const channel = interaction.client.channels.cache.get('1479225210417709150');
        if (!channel) return interaction.reply({ content: "Erreur : salon introuvable.", ephemeral: true });

        const f = interaction.fields;
        const msg = `
:scroll: **Convocations à la cour**
:warning: Avis important : Toute convocation est impérative.

:bust_in_silhouette: Demandeur : ${f.getTextInputValue('demandeur')}
:bust_in_silhouette: Défendeur : ${f.getTextInputValue('defendeur')}
:open_file_folder: Nature des faits : ${f.getTextInputValue('faits')}
:date: Date : ${f.getTextInputValue('date')}
:alarm_clock: Heure : ${f.getTextInputValue('heure')}
:classical_building: Lieu : ${f.getTextInputValue('lieu')}

:file_folder: Dossier traité par ${interaction.user.toString()}`;

        await channel.send(msg);
        return interaction.reply({ content: "Envoyé avec succès.", ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
