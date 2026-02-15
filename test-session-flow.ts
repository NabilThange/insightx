// Test script to verify session flow
// Run with: npx tsx test-session-flow.ts

import { supabase } from './lib/supabase';

async function testSessionFlow() {
  console.log('🧪 Testing Session Flow\n');

  try {
    // Test 1: List all sessions
    console.log('1️⃣ Fetching all sessions...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (sessionsError) throw sessionsError;
    console.log(`✅ Found ${sessions.length} sessions`);
    sessions.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.filename} (${s.status}) - ${s.row_count?.toLocaleString()} rows`);
    });

    // Test 2: Get session with chats
    console.log('\n2️⃣ Testing session with chats...');
    const sessionWithChats = 'f3ccc67c-dd05-4e4c-bdea-a298c754375e';
    
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionWithChats)
      .single();

    if (sessionError) throw sessionError;
    console.log(`✅ Session loaded: ${session.filename}`);
    console.log(`   Status: ${session.status}`);
    console.log(`   Has Data DNA: ${session.data_dna ? 'Yes' : 'No'}`);

    // Test 3: Get chats for session
    console.log('\n3️⃣ Fetching chats for session...');
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .eq('session_id', sessionWithChats)
      .order('created_at', { ascending: false });

    if (chatsError) throw chatsError;
    console.log(`✅ Found ${chats.length} chats`);
    chats.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.title}`);
    });

    // Test 4: Get messages for first chat
    if (chats.length > 0) {
      console.log('\n4️⃣ Fetching messages for first chat...');
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chats[0].id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      console.log(`✅ Found ${messages.length} messages in "${chats[0].title}"`);
      messages.forEach((m, i) => {
        const preview = m.content.substring(0, 60);
        console.log(`   ${i + 1}. [${m.role}] ${preview}${m.content.length > 60 ? '...' : ''}`);
      });
    }

    // Test 5: Create a test session
    console.log('\n5️⃣ Creating test session...');
    const { data: newSession, error: createError } = await supabase
      .from('sessions')
      .insert({
        filename: 'test_flow.csv',
        status: 'ready',
        row_count: 1000,
        data_dna: {
          filename: 'test_flow.csv',
          rowCount: 1000,
          columnCount: 5,
          uploadDate: new Date().toISOString(),
          columns: [],
          baselines: {},
          patterns: [],
          insights: []
        }
      })
      .select()
      .single();

    if (createError) throw createError;
    console.log(`✅ Test session created: ${newSession.id}`);
    console.log(`   URL: http://localhost:3000/workspace/${newSession.id}`);

    // Test 6: Create a test chat
    console.log('\n6️⃣ Creating test chat...');
    const { data: newChat, error: chatError } = await supabase
      .from('chats')
      .insert({
        session_id: newSession.id,
        title: 'Test Chat'
      })
      .select()
      .single();

    if (chatError) throw chatError;
    console.log(`✅ Test chat created: ${newChat.id}`);

    // Test 7: Create test messages
    console.log('\n7️⃣ Creating test messages...');
    const { data: newMessages, error: msgError } = await supabase
      .from('messages')
      .insert([
        {
          chat_id: newChat.id,
          role: 'user',
          content: 'Test user message'
        },
        {
          chat_id: newChat.id,
          role: 'assistant',
          content: 'Test assistant response'
        }
      ])
      .select();

    if (msgError) throw msgError;
    console.log(`✅ Created ${newMessages.length} test messages`);

    // Cleanup
    console.log('\n8️⃣ Cleaning up test data...');
    await supabase.from('sessions').delete().eq('id', newSession.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed! Session flow is working correctly.\n');
    console.log('📊 Summary:');
    console.log(`   - Total sessions: ${sessions.length}`);
    console.log(`   - Sessions with chats: ${sessions.filter(s => s.id === sessionWithChats).length}`);
    console.log(`   - Test session created and deleted successfully`);
    console.log('\n🔗 Test URLs:');
    console.log(`   - Session with chats: http://localhost:3000/workspace/${sessionWithChats}`);
    console.log(`   - All sessions: http://localhost:3000/reports`);
    console.log(`   - Create new: http://localhost:3000/connect`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testSessionFlow();
