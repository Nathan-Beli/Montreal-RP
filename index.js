require('dotenv').config();
const { Client, GatewayIntentBits, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const express = require('express');

// --- 1. SERVEUR POUR L'HÉBERGEUR (Health Check) ---
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(port, () => console.log(`Serveur santé actif sur port ${port}`));

// --- 2. CONFIGURATION DU BOT ---
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const SALON_AUDIANCE_ID = '1479225210417709150';

client.once('ready', async () => {
    console.log(`Bot connecté : ${client.user.tag}`);

    // --- 3. ENREGISTREMENT AUTOMATIQUE DE LA COMMANDE ---
    const commands = [
        new SlashCommandBuilder()
            .setName('audiance')
            .setDescription('Ouvre le formulaire de convocation à la cour')
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('Commande /audiance enregistrée avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement :', error);
    }
});

// --- 4. GESTION DES INTERACTIONS ---
client.on(Events.InteractionCreate, async interaction => {
    
    // Si c'est la commande /audiance
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'audiance') {
            const modal = new ModalBuilder()
                .setCustomId('modal_audiance')
                .setTitle('Convocation à la Cour');

            const inputs = [
                { id: 'demandeur', label: 'Demandeur (@Nom)', placeholder: '@Nom' },
                { id: 'defendeur', label: 'Défendeur (@Nom)', placeholder: '@Nom' },
                { id: 'faits', label: 'Nature des faits', placeholder: 'Objet du litige' },
                { id: 'date', label: 'Date (JJ/MM/AAAA)', placeholder: '30/06/2026' },
                { id: 'heure', label: 'Heure (HH:MM)', placeholder: '14:00' },
                { id: 'lieu', label: 'Lieu', placeholder: 'Salle du Tribunal' }
            ];

            const rows = inputs.map(i => 
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(i.id)
                        .setLabel(i.label)
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder(i.placeholder)
                        .setRequired(true)
                )
            );

            modal.addComponents(...rows);
            await interaction.showModal(modal);
        }
    }

    // Si c'est la soumission du formulaire
    else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'modal_audiance') {
            const channel = interaction.client.channels.cache.get(SALON_AUDIANCE_ID);
            if (!channel) return interaction.reply({ content: "Erreur : Salon introuvable.", ephemeral: true });

            const f = interaction.fields;
            const message = `
:scroll: **Convocations à la cour**
:warning: Avis important : Toute convocation est impérative. L'absence non justifiée de la partie défenderesse entraînera une perte automatique de la cause en faveur du demandeur.

Modèle de convocation :
:bust_in_silhouette: Demandeur : ${f.getTextInputValue('demandeur')}
:bust_in_silhouette: Défendeur : ${f.getTextInputValue('defendeur')}

:open_file_folder: Nature des faits : ${f.getTextInputValue('faits')}
:date: Date : ${f.getTextInputValue('date')}
:alarm_clock: Heure : ${f.getTextInputValue('heure')}
:classical_building: Lieu : ${f.getTextInputValue('lieu')}

:scales: La cour rappelle aux parties que le port d'une tenue appropriée et le respect du décorum sont exigés sous peine d'expulsion.
:file_folder: Dossier traité par ${interaction.user.toString()}`;

            await channel.send(message);
            await interaction.reply({ content: "La convocation a été envoyée avec succès.", ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
