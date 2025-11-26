import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, MessageSquare, Trash2 } from 'lucide-react-native';
import { GradientBackground } from '@components/common';
import { useTheme } from '@hooks/useTheme';
import { useAuthStore } from '@store';
import { firestoreService } from '@services/firebase';
import { format } from 'date-fns';
import { styles, useStyles } from './ChatHistoryScreen.styles';

interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: any;
  updatedAt: any;
  messageCount?: number;
}

export const ChatHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const dynamicStyles = useStyles();
  const { user } = useAuthStore();
  const [chats, setChats] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChatHistory();
  }, [user?.uid]);

  const loadChatHistory = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const chatData = await firestoreService.getChats(user.uid);
      // Get only last 20 chats
      setChats(chatData.slice(0, 20));
    } catch (error) {
      console.error('Failed to load chat history:', error);
      Alert.alert('Error', 'Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chatId: string) => {
    // Navigate back to Main navigator, then to Chat tab with the chatId
    navigation.navigate(
      'Main' as never,
      {
        screen: 'Chat',
        params: { chatId },
      } as never,
    );
  };

  const handleDeleteChat = async (chatId: string) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user?.uid) return;
              await firestoreService.deleteChat(user.uid, chatId);
              // Refresh the list
              loadChatHistory();
            } catch (error) {
              console.error('Failed to delete chat:', error);
              Alert.alert('Error', 'Failed to delete chat');
            }
          },
        },
      ],
    );
  };

  const formatDate = (timestamp: any) => {
    try {
      if (!timestamp) return 'Recent';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Recent';
    }
  };

  const renderChatItem = ({ item }: { item: ChatHistoryItem }) => (
    <TouchableOpacity
      style={[styles.chatItem, dynamicStyles.chatItem()]}
      onPress={() => handleChatSelect(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.chatIcon, dynamicStyles.chatIcon()]}>
        <MessageSquare size={24} color={colors.primary} />
      </View>
      <View style={styles.chatInfo}>
        <Text
          style={[styles.chatTitle, dynamicStyles.chatTitle()]}
          numberOfLines={1}
        >
          {item.title || 'NCLEX Study Session'}
        </Text>
        <Text
          style={[styles.chatPreview, dynamicStyles.chatPreview()]}
          numberOfLines={2}
        >
          {item.lastMessage || 'No messages yet'}
        </Text>
        <Text style={[styles.chatDate, dynamicStyles.chatDate()]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteChat(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Trash2 size={20} color={colors.error || '#EF4444'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle()]}>
            Chat History
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Chat List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, dynamicStyles.loadingText()]}>
              Loading chat history...
            </Text>
          </View>
        ) : chats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MessageSquare
              size={64}
              color={colors.textSecondary || '#9CA3AF'}
            />
            <Text style={[styles.emptyText, dynamicStyles.emptyText()]}>
              No chat history yet
            </Text>
            <Text style={[styles.emptySubtext, dynamicStyles.emptySubtext()]}>
              Start a conversation to see it here
            </Text>
          </View>
        ) : (
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </GradientBackground>
  );
};
