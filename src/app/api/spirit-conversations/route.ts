/**
 * Spirit Conversations API - Tables dédiées
 * Plus de hack VoiceMemo - données persistantes et fiables
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';

// GET - List all spirit conversations for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-admin';
    const conversationId = searchParams.get('conversationId');
    const archetype = searchParams.get('archetype');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get specific conversation with messages
    if (conversationId) {
      const conversation = await db.spiritConversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
        include: {
          SpiritMessage: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      return NextResponse.json({ conversation });
    }

    // Build where clause
    const where: any = { userId };
    if (archetype) {
      where.archetype = archetype;
    }

    // Get all conversations (optionally filtered by archetype)
    const conversations = await db.spiritConversation.findMany({
      where,
      include: {
        SpiritMessage: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    // Format for frontend - include full messages for history display
    const formatted = conversations.map((conv) => ({
      id: conv.id,
      archetype: conv.archetype,
      title: conv.title,
      messageCount: conv.SpiritMessage.length,
      messages: conv.SpiritMessage.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      })),
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    }));

    return NextResponse.json({ conversations: formatted });
  } catch (error) {
    console.error('Error fetching spirit conversations:', error);
    return NextResponse.json({ conversations: [] });
  }
}

// POST - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, archetype, title, messages } = body;

    if (!archetype) {
      return NextResponse.json({ error: 'Archetype is required' }, { status: 400 });
    }

    const targetUserId = userId || 'user-admin';
    const conversationId = `spirit-${targetUserId}-${Date.now()}`;

    // Create conversation with messages
    const conversation = await db.spiritConversation.create({
      data: {
        id: conversationId,
        userId: targetUserId,
        archetype,
        title: title || `Conversation ${archetype}`,
        SpiritMessage: messages && messages.length > 0
          ? {
              create: messages.map((msg: { role: string; content: string }, index: number) => ({
                id: `spiritmsg-${conversationId}-${index}`,
                role: msg.role,
                content: msg.content,
              })),
            }
          : undefined,
      },
      include: {
        SpiritMessage: true,
      },
    });

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        archetype: conversation.archetype,
        title: conversation.title,
        messageCount: conversation.SpiritMessage.length,
        createdAt: conversation.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating spirit conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}

// PUT - Add message to conversation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message, userId } = body;

    if (!conversationId || !message) {
      return NextResponse.json({ error: 'ConversationId and message are required' }, { status: 400 });
    }

    const targetUserId = userId || 'user-admin';

    // Verify ownership
    const conversation = await db.spiritConversation.findFirst({
      where: { id: conversationId, userId: targetUserId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Add message
    const newMessage = await db.spiritMessage.create({
      data: {
        id: `spiritmsg-${conversationId}-${Date.now()}`,
        conversationId,
        role: message.role,
        content: message.content,
      },
    });

    // Update conversation timestamp
    await db.spiritConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('Error adding message to spirit conversation:', error);
    return NextResponse.json({ error: 'Failed to add message' }, { status: 500 });
  }
}

// DELETE - Delete a conversation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || 'user-admin';

    if (!id) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Verify ownership and delete
    const deleted = await db.spiritConversation.deleteMany({
      where: { id, userId },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting spirit conversation:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}
