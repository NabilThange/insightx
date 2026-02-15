// Test script to verify Supabase connection
// Run with: npx tsx lib/test-connection.ts

import { supabase } from './supabase';

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  try {
    // Test 1: Check connection
    const { data, error } = await supabase.from('sessions').select('count');
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }

    console.log('✅ Connection successful!');
    console.log('📊 Sessions table accessible\n');

    // Test 2: Create a test session
    console.log('🧪 Creating test session...');
    const { data: session, error: createError } = await supabase
      .from('sessions')
      .insert({
        user_id: 'test-user',
        filename: 'test.csv',
        status: 'uploading',
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create session:', createError.message);
      return;
    }

    console.log('✅ Test session created:', session.id);

    // Test 3: Create a test chat
    console.log('🧪 Creating test chat...');
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({
        session_id: session.id,
        title: 'Test Chat',
      })
      .select()
      .single();

    if (chatError) {
      console.error('❌ Failed to create chat:', chatError.message);
      return;
    }

    console.log('✅ Test chat created:', chat.id);

    // Test 4: Create test messages
    console.log('🧪 Creating test messages...');
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .insert([
        {
          chat_id: chat.id,
          role: 'user',
          content: 'Hello, test message!',
        },
        {
          chat_id: chat.id,
          role: 'assistant',
          content: 'Test response from assistant',
        },
      ])
      .select();

    if (msgError) {
      console.error('❌ Failed to create messages:', msgError.message);
      return;
    }

    console.log('✅ Test messages created:', messages.length);

    // Test 5: Query messages
    console.log('🧪 Querying messages...');
    const { data: queriedMessages, error: queryError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: true });

    if (queryError) {
      console.error('❌ Failed to query messages:', queryError.message);
      return;
    }

    console.log('✅ Messages retrieved:', queriedMessages.length);
    queriedMessages.forEach((msg, i) => {
      console.log(`   ${i + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`);
    });

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('sessions').delete().eq('id', session.id);
    console.log('✅ Cleanup complete');

    console.log('\n🎉 All tests passed! Supabase integration is working correctly.');
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testConnection();
