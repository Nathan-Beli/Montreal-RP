require('dotenv').config();
const { Client, GatewayIntentBits, Events, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const SALON_AUDIANCE_ID = '1479225210417709150';

client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
});

// Écoute des interactions
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
            if (!channel) return interaction.reply({ content: "Salon introuvable.", ephemeral: true });

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
            await interaction.reply({ content: "La convocation a été envoyée.", ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
