const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('audiance')
        .setDescription('Ouvre le formulaire de convocation à la cour'),

    async execute(interaction) {
        // 1. Création du formulaire (Modal)
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
    },

    // 2. Gestion de la soumission du formulaire
    async executeModal(interaction) {
        if (interaction.customId !== 'modal_audiance') return;

        const channel = interaction.client.channels.cache.get('1479225210417709150');
        if (!channel) {
            return interaction.reply({ content: "Erreur : Salon introuvable.", ephemeral: true });
        }

        const fields = interaction.fields;
        
        // Construction du message texte
        const messageContent = `
:scroll: **Convocations à la cour**
:warning: Avis important : Toute convocation est impérative. L'absence non justifiée de la partie défenderesse entraînera une perte automatique de la cause en faveur du demandeur.

Modèle de convocation :
:bust_in_silhouette: Demandeur : ${fields.getTextInputValue('demandeur')}
:bust_in_silhouette: Défendeur : ${fields.getTextInputValue('defendeur')}

:open_file_folder: Nature des faits : ${fields.getTextInputValue('faits')}
:date: Date : ${fields.getTextInputValue('date')}
:alarm_clock: Heure : ${fields.getTextInputValue('heure')}
:classical_building: Lieu : ${fields.getTextInputValue('lieu')}

:scales: La cour rappelle aux parties que le port d'une tenue appropriée et le respect du décorum sont exigés sous peine d'expulsion.
:file_folder: Dossier traité par ${interaction.user.toString()}`;

        // Envoi du message dans le salon cible
        await channel.send(messageContent);
        
        // Confirmation invisible pour l'utilisateur qui a fait la commande
        await interaction.reply({ content: "La convocation a été envoyée avec succès.", ephemeral: true });
    }
};
