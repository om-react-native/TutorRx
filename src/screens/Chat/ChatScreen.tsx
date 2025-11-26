import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  PermissionsAndroid,
  Linking,
  Image,
} from 'react-native';
import {
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
// @ts-ignore - react-native-audio doesn't have TypeScript definitions
import { AudioRecorder, AudioUtils } from 'react-native-audio';
// @ts-ignore - react-native-sound doesn't have TypeScript definitions
import Sound from 'react-native-sound';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus,
  ArrowUp,
  Mic,
  Image as ImageIcon,
  X,
  Play,
  Pause,
  Download,
  Clock,
} from 'lucide-react-native';
import { GradientBackground } from '@components/common';
import { firestoreService } from '@services/firebase';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { useTheme } from '@hooks/useTheme';
import { useAuthStore } from '@store';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  buildChatMessages,
  generateImage,
  streamChatCompletion,
  transcribeAudio,
} from '@services/openai/chatSession';
import { styles, useStyles } from './ChatScreen.styles';
import type { ChatMessage } from '../../types/chat';

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const paramChatId = route.params?.chatId;
  const { colors, isDark } = useTheme();
  const dynamicStyles = useStyles();
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [recordingPath, setRecordingPath] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<Sound | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [lastVisible, setLastVisible] =
    useState<FirebaseFirestoreTypes.QueryDocumentSnapshot | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Ensure we have a chat document for this user/session
  useEffect(() => {
    const initChat = async () => {
      if (!user?.uid) {
        return;
      }

      try {
        // Use paramChatId if provided from navigation (history selection)
        if (paramChatId && !chatId) {
          setChatId(paramChatId);
        } else if (!chatId && !paramChatId) {
          // Create a new chat only if no chatId exists and no param provided
          const newChatId = await firestoreService.createChat(user.uid, {
            title: 'NCLEX Study Session',
            lastMessage: '',
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
          setChatId(newChatId);
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    };

    initChat();
  }, [user, chatId, paramChatId]);

  // Subscribe to latest messages for this chat
  useEffect(() => {
    if (!user?.uid || !chatId) {
      return;
    }

    setIsLoadingMessages(true);

    const messagesRef = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .limit(30);

    const unsubscribe = messagesRef.onSnapshot(
      snapshot => {
        const docs = snapshot.docs;
        const loadedMessages: ChatMessage[] = docs.map(doc => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            role: data.role,
            content: data.content || '',
            timestamp: data.timestamp?.toDate
              ? data.timestamp.toDate()
              : new Date(),
            imageUri: data.imageUri,
            audioUri: data.audioUri,
            tokensUsed: data.tokensUsed,
            messageType: data.messageType,
          };
        });

        setMessages(loadedMessages);
        if (docs.length > 0) {
          setLastVisible(docs[docs.length - 1]);
        }
        setHasMoreMessages(docs.length === 30);
        setIsLoadingMessages(false);

        // Auto-scroll when initial load completes
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      error => {
        console.error('Failed to load messages:', error);
        setIsLoadingMessages(false);
      },
    );

    return () => unsubscribe();
  }, [user?.uid, chatId]);

  const loadMoreMessages = async () => {
    if (
      !user?.uid ||
      !chatId ||
      !lastVisible ||
      !hasMoreMessages ||
      isLoadingMessages
    ) {
      return;
    }

    try {
      setIsLoadingMessages(true);

      const olderMessagesRef = firestore()
        .collection('users')
        .doc(user.uid)
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .startAfter(lastVisible)
        .limit(30);

      const snapshot = await olderMessagesRef.get();
      const docs = snapshot.docs;

      if (docs.length === 0) {
        setHasMoreMessages(false);
        setIsLoadingMessages(false);
        return;
      }

      const olderMessages: ChatMessage[] = docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          role: data.role,
          content: data.content || '',
          timestamp: data.timestamp?.toDate
            ? data.timestamp.toDate()
            : new Date(),
          imageUri: data.imageUri,
          audioUri: data.audioUri,
          tokensUsed: data.tokensUsed,
          messageType: data.messageType,
        };
      });

      setMessages(prev => [...olderMessages, ...prev]);
      setLastVisible(docs[docs.length - 1]);
      setHasMoreMessages(docs.length === 30);
      setIsLoadingMessages(false);
    } catch (error) {
      console.error('Failed to load more messages:', error);
      setIsLoadingMessages(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleNewChat = () => {
    setChatId(null);
    setMessages([]);
    // Clear navigation params by navigating to Chat without params
    navigation.setParams({ chatId: undefined } as never);
    // This will trigger the useEffect to create a new chat
  };

  const handleOpenHistory = () => {
    navigation.navigate('ChatHistory' as never);
  };

  const isPremium = user?.subscriptionStatus === 'premium';
  const canSend =
    message.trim().length > 0 ||
    selectedImage !== null ||
    recordingPath !== null;

  const sendMessageToFirestore = async (
    baseMessage: Omit<ChatMessage, 'id' | 'timestamp'> & {
      timestamp?: Date;
      tokensUsed?: number;
    },
    extraData?: { tokensUsed?: number },
  ): Promise<void> => {
    if (!user?.uid || !chatId) {
      return;
    }

    const payload = {
      role: baseMessage.role,
      content: baseMessage.content,
      imageUri: baseMessage.imageUri || null,
      audioUri: baseMessage.audioUri || null,
      messageType: baseMessage.messageType || 'text',
      tokensUsed: extraData?.tokensUsed ?? baseMessage.tokensUsed ?? null,
    };

    await firestoreService.addMessage(user.uid, chatId, payload);

    // Update chat metadata
    await firestore()
      .collection('users')
      .doc(user.uid)
      .collection('chats')
      .doc(chatId)
      .update({
        lastMessage: baseMessage.content,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedImage && !recordingPath) {
      return;
    }

    if (!user?.uid || !chatId) {
      Alert.alert('Error', 'Chat is not ready yet. Please try again.');
      return;
    }

    try {
      let userContent = message.trim();

      // If we have an audio recording, transcribe it first
      if (recordingPath) {
        const audioFileName = recordingPath;
        const audioPath = `${AudioUtils.DocumentDirectoryPath}/${audioFileName}`;
        const audioUri = `file://${audioPath}`;

        try {
          const transcript = await transcribeAudio(audioUri);
          if (transcript) {
            userContent = transcript;
          }
        } catch (error: any) {
          console.error('Audio transcription failed:', error);
          Alert.alert(
            'Audio Error',
            'Could not transcribe your audio. Sending your text (if any) instead.',
          );
        }
      }

      const messageType: ChatMessage['messageType'] =
        recordingPath != null
          ? 'audio'
          : selectedImage != null
          ? 'image'
          : 'text';

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: userContent || message.trim(),
        timestamp: new Date(),
        imageUri: selectedImage || undefined,
        audioUri: recordingPath || undefined,
        messageType,
      };

      const nextMessages = [...messages, newMessage];
      setMessages(nextMessages);
      setMessage('');
      setSelectedImage(null);
      setRecordingPath(null);

      // Optimistically write to Firestore
      sendMessageToFirestore(newMessage).catch(error => {
        console.error('Failed to save user message:', error);
      });

      // Auto-scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Prepare history for the model (last 20 messages)
      const historyForModel = nextMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      const modelMessages = buildChatMessages(
        historyForModel.slice(0, -1),
        historyForModel[historyForModel.length - 1]?.content || '',
      );

      const wantsImageAnswer =
        /diagram|image|picture|flow ?chart/i.test(
          newMessage.content.toLowerCase(),
        ) && !selectedImage;

      // Streaming assistant response
      setIsTyping(true);

      const assistantMessageId = `${Date.now().toString()}-assistant`;
      let accumulated = '';

      setMessages(prev => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          messageType: 'text',
        },
      ]);

      const result = await streamChatCompletion({
        messages: modelMessages,
        onDelta: delta => {
          accumulated += delta;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: accumulated,
                  }
                : msg,
            ),
          );
        },
      });

      setIsTyping(false);

      // Persist assistant message
      const finalContent = accumulated || result.message;
      if (finalContent.trim().length > 0) {
        sendMessageToFirestore(
          {
            role: 'assistant',
            content: finalContent,
            imageUri: undefined,
            audioUri: undefined,
            messageType: 'text',
          },
          {
            tokensUsed: result.usage?.total_tokens,
          },
        ).catch(error => {
          console.error('Failed to save assistant message:', error);
        });
      }

      // If the user asked for an image, generate one and send as a separate message
      if (wantsImageAnswer) {
        // Check if user is premium before generating image
        if (!isPremium) {
          const premiumMessage: ChatMessage = {
            id: `${Date.now().toString()}-premium-prompt`,
            role: 'assistant',
            content:
              '🔒 AI image generation is a premium feature. Upgrade to TutorRx Premium to unlock visual diagrams, flowcharts, and educational illustrations!',
            timestamp: new Date(),
            messageType: 'text',
          };

          setMessages(prev => [...prev, premiumMessage]);

          // Optionally save this message to Firestore
          sendMessageToFirestore(premiumMessage).catch(error => {
            console.error('Failed to save premium prompt message:', error);
          });

          // Show upgrade dialog
          setTimeout(() => {
            Alert.alert(
              'Premium Feature',
              'AI-generated images and diagrams are available for premium members only.',
              [
                { text: 'Maybe Later', style: 'cancel' },
                {
                  text: 'Upgrade to Premium',
                  onPress: () => navigation.navigate('Premium' as never),
                },
              ],
            );
          }, 500);
        } else {
          // User is premium, proceed with image generation
          try {
            const imagePrompt = `Create a clear, educational diagram to help a nursing student understand: ${newMessage.content}`;
            const imageUrl = await generateImage(imagePrompt);

            if (imageUrl) {
              const imageMessage: ChatMessage = {
                id: `${Date.now().toString()}-assistant-image`,
                role: 'assistant',
                content: 'Here is a diagram to help visualize this concept.',
                timestamp: new Date(),
                imageUri: imageUrl,
                messageType: 'image_answer',
              };

              setMessages(prev => [...prev, imageMessage]);

              sendMessageToFirestore(imageMessage).catch(error => {
                console.error('Failed to save assistant image message:', error);
              });
            }
          } catch (error) {
            console.error('Failed to generate image:', error);
            Alert.alert(
              'Generation Failed',
              'Could not generate the image. Please try again.',
            );
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
      Alert.alert(
        'Error',
        error.message || 'Something went wrong while sending your message.',
      );
    }
  };

  const handlePlayAudio = (audioUri: string) => {
    try {
      if (isPlayingAudio === audioUri) {
        // Stop playing
        if (audioPlayer) {
          audioPlayer.stop();
          audioPlayer.release();
        }
        setIsPlayingAudio(null);
        setAudioPlayer(null);
      } else {
        // Stop current audio if playing
        if (audioPlayer) {
          audioPlayer.stop();
          audioPlayer.release();
        }

        // Determine sound source type and path
        let soundPath = audioUri;
        let soundSource: string;

        if (audioUri.startsWith('http')) {
          // Remote URL
          soundSource = '';
        } else if (audioUri.includes('/')) {
          // Full path - extract just the filename
          const parts = audioUri.split('/');
          soundPath = parts[parts.length - 1];
          soundSource = Sound.DOCUMENT;
        } else {
          // Just filename
          soundPath = audioUri;
          soundSource = Sound.DOCUMENT;
        }

        // Start new audio
        const player = new Sound(soundPath, soundSource, error => {
          if (error) {
            console.error('Failed to load audio:', error);
            console.error('Audio path:', soundPath);
            console.error('Sound source:', soundSource);
            Alert.alert(
              'Error',
              `Failed to load audio file: ${error.message || 'Unknown error'}`,
            );
            setIsPlayingAudio(null);
            setAudioPlayer(null);
            return;
          }

          // Play audio
          player.play(success => {
            if (success) {
              console.log('Audio playback finished');
            } else {
              console.log('Audio playback failed');
            }
            setIsPlayingAudio(null);
            setAudioPlayer(null);
            player.release();
          });
        });

        player.setVolume(1.0);
        setIsPlayingAudio(audioUri);
        setAudioPlayer(player);
      }
    } catch (error: any) {
      console.error('Audio playback error:', error);
      Alert.alert(
        'Error',
        `Failed to play audio: ${error.message || 'Unknown error'}`,
      );
      setIsPlayingAudio(null);
      setAudioPlayer(null);
    }
  };

  const handleDownloadImage = async (imageUri: string) => {
    // Check premium status first
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Image download is available for premium members only. Upgrade to unlock this feature!',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade to Premium',
            onPress: () => navigation.navigate('Premium' as never),
          },
        ],
      );
      return;
    }

    try {
      // Request permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'TutorRx needs permission to save images to your device',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Denied',
            'Cannot save image without storage permission',
          );
          return;
        }
      }

      // Save image to camera roll
      await CameraRoll.save(imageUri, { type: 'photo' });

      Alert.alert('Success', 'Image has been saved to your photo gallery!', [
        { text: 'OK' },
      ]);
    } catch (error) {
      console.error('Failed to download image:', error);
      Alert.alert(
        'Download Failed',
        'Could not save image to your device. Please try again.',
      );
    }
  };

  // Cleanup audio player on unmount
  useEffect(() => {
    return () => {
      if (audioPlayer) {
        try {
          audioPlayer.stop();
          audioPlayer.release();
        } catch (error) {
          console.error('Audio cleanup error:', error);
        }
      }
    };
  }, [audioPlayer]);

  // Enable playback in silence mode (iOS)
  useEffect(() => {
    Sound.setCategory('Playback');
  }, []);

  // Request Android permissions
  const requestAndroidPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      return (
        granted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  // Request audio permission
  const requestAudioPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message:
              'TutorRx needs access to your microphone to record audio messages.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Audio permission error:', err);
        return false;
      }
    }
    // iOS permissions are handled automatically by the library
    return true;
  };

  const handleImagePick = async () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Image upload is available for premium members only. Upgrade to unlock this feature!',
        [{ text: 'OK' }],
      );
      return;
    }

    // Request permissions
    const hasPermission = await requestAndroidPermissions();
    if (!hasPermission && Platform.OS === 'android') {
      Alert.alert(
        'Permission Required',
        'Please grant camera and storage permissions to upload images.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings(),
          },
        ],
      );
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          return;
        }

        if (response.assets && response.assets[0]) {
          let imageUri = response.assets[0].uri;
          if (imageUri) {
            // Fix iOS file:// URI format if needed
            if (Platform.OS === 'ios' && imageUri.startsWith('file://')) {
              // Keep file:// prefix for iOS
              imageUri = imageUri;
            } else if (
              Platform.OS === 'android' &&
              !imageUri.startsWith('file://') &&
              !imageUri.startsWith('http')
            ) {
              // Ensure Android has proper URI format
              imageUri = imageUri.startsWith('/')
                ? `file://${imageUri}`
                : imageUri;
            }
            console.log('Selected image URI:', imageUri);
            setSelectedImage(imageUri);
          }
        }
      },
    );
  };

  const handleRecording = async () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Audio recording is available for premium members only. Upgrade to unlock this feature!',
        [{ text: 'OK' }],
      );
      return;
    }

    if (isRecording) {
      // Stop recording
      try {
        AudioRecorder.stopRecording();
        setIsRecording(false);
        // Store just the filename for react-native-sound
        const audioFileName = 'audio.m4a';
        setRecordingPath(audioFileName);
      } catch (error) {
        console.error('Stop recording error:', error);
        Alert.alert('Error', 'Failed to stop recording');
        setIsRecording(false);
      }
    } else {
      // Start recording
      const hasPermission = await requestAudioPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant microphone permission to record audio.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ],
        );
        return;
      }

      try {
        // Use consistent filename for recording and playback
        const audioFileName = 'audio.m4a';
        const audioPath =
          AudioUtils.DocumentDirectoryPath + '/' + audioFileName;

        const audioSet = {
          SampleRate: 22050,
          Channels: 1,
          AudioQuality: 'High',
          AudioEncoding: 'aac',
          AudioEncodingBitRate: 32000,
        };

        AudioRecorder.prepareRecordingAtPath(audioPath, audioSet);

        AudioRecorder.onFinished = (data: any) => {
          console.log('Recording finished:', data);
        };

        await AudioRecorder.startRecording();
        setIsRecording(true);
        setRecordingPath(null);
      } catch (error) {
        console.error('Start recording error:', error);
        Alert.alert('Error', 'Failed to start recording');
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        try {
          AudioRecorder.stopRecording();
        } catch (error) {
          console.error('Cleanup recording error:', error);
        }
      }
    };
  }, [isRecording]);

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -100 : -90}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={[styles.appName, dynamicStyles.appName()]}>
                TutorRx
              </Text>
            </View>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={handleOpenHistory}
              style={[styles.headerButton, dynamicStyles.headerButton()]}
            >
              <Clock size={22} color={isDark ? '#FFFFFF' : colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNewChat}
              style={[styles.headerButton, dynamicStyles.headerButton()]}
            >
              <Plus size={24} color={isDark ? '#FFFFFF' : colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          {/* <Text style={[styles.title, dynamicStyles.title()]}>AI Chat</Text> */}
          <Text style={[styles.subtitle, dynamicStyles.subtitle()]}>
            Get help with NCLEX topics
          </Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onScrollEndDrag={event => {
            const offsetY = event.nativeEvent.contentOffset.y;
            if (offsetY <= 0) {
              loadMoreMessages();
            }
          }}
        >
          {messages.length === 0 && !isTyping && (
            <View style={styles.titleSection}>
              <Text style={[styles.subtitle, dynamicStyles.subtitle()]}>
                Ask a question about any NCLEX topic to start your conversation.
              </Text>
            </View>
          )}

          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.messageWrapper,
                msg.role === 'user'
                  ? styles.userMessageWrapper
                  : styles.assistantMessageWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  msg.role === 'user'
                    ? dynamicStyles.userMessageBubble()
                    : dynamicStyles.assistantMessageBubble(),
                ]}
              >
                {msg.imageUri && (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: msg.imageUri }}
                      style={styles.messageImage}
                      resizeMode="cover"
                      onError={error => {
                        console.error('Message image error:', error);
                        console.error('Image URI:', msg.imageUri);
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', msg.imageUri);
                      }}
                    />
                    <TouchableOpacity
                      style={[
                        styles.imageDownloadButton,
                        dynamicStyles.imageDownloadButton(isPremium),
                      ]}
                      onPress={() => handleDownloadImage(msg.imageUri!)}
                    >
                      <Download
                        size={16}
                        color={
                          isPremium ? colors.primary : colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.imageDownloadText,
                          dynamicStyles.imageDownloadText(isPremium),
                        ]}
                      >
                        {isPremium ? 'Download Image' : 'Premium Only'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {msg.audioUri && (
                  <TouchableOpacity
                    onPress={() => handlePlayAudio(msg.audioUri!)}
                    style={[styles.audioPlayer, dynamicStyles.audioPlayer()]}
                  >
                    {isPlayingAudio === msg.audioUri ? (
                      <Pause size={20} color={isDark ? '#1A1A1A' : '#1A1A1A'} />
                    ) : (
                      <Play size={20} color={isDark ? '#1A1A1A' : '#1A1A1A'} />
                    )}
                    <Text
                      style={[
                        styles.audioPlayerText,
                        dynamicStyles.audioPlayerText(),
                      ]}
                    >
                      {isPlayingAudio === msg.audioUri
                        ? 'Playing...'
                        : 'Tap to play'}
                    </Text>
                  </TouchableOpacity>
                )}
                {msg.content ? (
                  <Text
                    style={[
                      styles.messageText,
                      msg.role === 'user'
                        ? dynamicStyles.userMessageText()
                        : dynamicStyles.assistantMessageText(),
                    ]}
                  >
                    {msg.content}
                  </Text>
                ) : null}
              </View>
              <Text
                style={[
                  styles.timestamp,
                  msg.role === 'user'
                    ? styles.userTimestamp
                    : styles.assistantTimestamp,
                  dynamicStyles.timestamp(),
                ]}
              >
                {formatTime(msg.timestamp)}
              </Text>
            </View>
          ))}
          {isTyping && (
            <View
              style={[styles.messageWrapper, styles.assistantMessageWrapper]}
            >
              <View
                style={[
                  styles.messageBubble,
                  dynamicStyles.assistantMessageBubble(),
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    dynamicStyles.assistantMessageText(),
                  ]}
                >
                  TutorRx is typing...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Preview Section */}
        {(selectedImage || recordingPath) && (
          <View style={styles.previewContainer}>
            {selectedImage && (
              <View style={styles.previewItem}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.previewImage}
                  resizeMode="cover"
                  onError={error => {
                    console.error('Preview image error:', error);
                    Alert.alert('Error', 'Failed to load preview image');
                    setSelectedImage(null);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setSelectedImage(null)}
                  style={[
                    styles.previewCloseButton,
                    dynamicStyles.previewCloseButton(),
                  ]}
                  activeOpacity={0.7}
                >
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
            {recordingPath && (
              <View style={styles.previewItem}>
                <TouchableOpacity
                  onPress={() => handlePlayAudio(recordingPath)}
                  style={[styles.previewAudio, dynamicStyles.previewAudio()]}
                >
                  {isPlayingAudio === recordingPath ? (
                    <Pause size={20} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
                  ) : (
                    <Play size={20} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
                  )}
                  <Text
                    style={[
                      styles.previewAudioText,
                      dynamicStyles.previewAudioText(),
                    ]}
                  >
                    {isPlayingAudio === recordingPath
                      ? 'Playing...'
                      : 'Preview audio'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setRecordingPath(null)}
                  style={styles.previewCloseButton}
                >
                  <X size={16} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Message Input */}
        <View
          style={[
            styles.inputContainer,
            dynamicStyles.inputContainer(),
            { paddingBottom: 8 },
          ]}
        >
          <View style={[styles.inputWrapper, dynamicStyles.inputWrapper()]}>
            {/* Left Actions */}
            <View style={styles.leftActions}>
              <TouchableOpacity
                onPress={handleImagePick}
                style={[
                  styles.actionButton,
                  dynamicStyles.actionButton(isPremium),
                ]}
                activeOpacity={0.7}
              >
                <ImageIcon
                  size={20}
                  color={
                    isPremium
                      ? isDark
                        ? '#FFFFFF'
                        : colors.text
                      : colors.textTertiary
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRecording}
                style={[
                  styles.actionButton,
                  dynamicStyles.actionButton(isPremium),
                  isRecording && dynamicStyles.recordingActive(),
                ]}
                activeOpacity={0.7}
              >
                <Mic
                  size={20}
                  color={
                    isRecording
                      ? colors.error
                      : isPremium
                      ? isDark
                        ? '#FFFFFF'
                        : colors.text
                      : colors.textTertiary
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Text Input */}
            <TextInput
              style={[styles.input, dynamicStyles.input()]}
              placeholder="Message"
              placeholderTextColor={
                isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
              }
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
            />

            {/* Send Button */}
            <TouchableOpacity
              onPress={handleSend}
              disabled={!canSend}
              style={[styles.sendButton, dynamicStyles.sendButton(canSend)]}
              activeOpacity={0.7}
            >
              <ArrowUp
                size={20}
                color={canSend ? '#FFFFFF' : colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety disclaimer */}
        <View
          style={[
            styles.footerDisclaimer,
            { paddingBottom: insets.bottom + 80 },
          ]}
        >
          <Text style={[styles.subtitle, dynamicStyles.subtitle()]}>
            TutorRx can make mistakes. Always verify critical information.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};
