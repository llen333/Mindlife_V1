/**
 * Migration Script: VoiceMemo -> SpiritConversation
 * Migre les conversations spirituelles depuis VoiceMemo vers les tables dédiées
 */

import { db } from '../src/lib/db';

async function migrateSpiritData() {
  console.log('🔄 Début de la migration des données Spirit...\n');

  try {
    // 1. Récupérer tous les VoiceMemos de type spirit_conversation
    const spiritMemos = await db.voiceMemo.findMany({
      where: {
        category: 'spirit_conversation',
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`📊 Trouvé ${spiritMemos.length} conversations à migrer.\n`);

    if (spiritMemos.length === 0) {
      console.log('✅ Aucune donnée à migrer.');
      return;
    }

    // 2. Pour chaque memo, créer une SpiritConversation et ses messages
    let migrated = 0;
    let errors = 0;

    for (const memo of spiritMemos) {
      try {
        // Parser les messages depuis le transcript
        let messages: Array<{ role: string; content: string; timestamp?: string }> = [];
        try {
          messages = JSON.parse(memo.transcript || '[]');
        } catch {
          console.log(`⚠️  Impossible de parser les messages pour ${memo.id}`);
          errors++;
          continue;
        }

        if (!messages || messages.length === 0) {
          console.log(`⚠️  Aucun message pour ${memo.id}`);
          continue;
        }

        // Créer la conversation
        const conversation = await db.spiritConversation.create({
          data: {
            userId: memo.userId,
            archetype: memo.title || 'stoicien',
            title: `Conversation du ${memo.createdAt.toLocaleDateString('fr-FR')}`,
            createdAt: memo.createdAt,
            updatedAt: memo.updatedAt,
          } as any,
        });

        // Créer les messages
        for (const msg of messages) {
          await db.spiritMessage.create({
            data: {
              conversationId: conversation.id,
              role: msg.role,
              content: msg.content,
              createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            } as any,
          });
        }

        migrated++;
        console.log(`✅ Migré: ${conversation.id} (${messages.length} messages)`);

      } catch (error) {
        console.error(`❌ Erreur pour ${memo.id}:`, error);
        errors++;
      }
    }

    console.log(`\n📈 Migration terminée !`);
    console.log(`   - Migrées: ${migrated}`);
    console.log(`   - Erreurs: ${errors}`);

    // 3. Optionnel: Supprimer les anciens VoiceMemos migrés
    console.log('\n🗑️  Suppression des anciens VoiceMemos spirit_conversation...');
    const deleted = await db.voiceMemo.deleteMany({
      where: {
        category: 'spirit_conversation',
      },
    });
    console.log(`   - Supprimés: ${deleted.count}`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }

  await db.$disconnect();
}

migrateSpiritData();
