import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInRight, FadeOutLeft, Easing, SlideInDown } from 'react-native-reanimated';
import { useAppTheme, typography, spacing } from '../../utils/theme';
import { Sparkles, KeyRound, Mail, ShieldCheck, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Welcome to ProReach',
    description: 'Automate your professional outreach with hyper-personalized AI drafting and direct email delivery.',
    Icon: Sparkles,
  },
  {
    id: 2,
    title: 'How It Works',
    description: 'ProReach analyzes job descriptions, crafts the perfect pitch using AI, and sends it directly via SMTP from your own inbox.',
    Icon: Zap,
  },
  {
    id: 3,
    title: 'Your Credentials',
    description: 'To begin, you\'ll need to enter three things in Settings: your Email ID, a Gmail App Password (for secure sending), and a Gemini API Key.',
    Icon: KeyRound,
  },
  {
    id: 4,
    title: 'Local Privacy First',
    description: 'Your sensitive API keys and App Passwords never touch our servers. They are encrypted and stored safely on your device.',
    Icon: ShieldCheck,
  },
  {
    id: 5,
    title: 'Ready for Launch',
    description: 'Create your first professional identity profile and step into the future of automated outreach.',
    Icon: Mail,
  }
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colors, isDark } = useAppTheme();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('CreateProfile');
    }
  };

  const handleSkip = () => {
    navigation.navigate('CreateProfile');
  };

  const slide = slides[currentSlide];
  const IconComponent = slide.Icon;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View 
        key={currentSlide}
        entering={FadeInRight.duration(400).easing(Easing.out(Easing.cubic))}
        exiting={FadeOutLeft.duration(300)}
        style={styles.content}
      >
        <View style={[styles.illustrationContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}>
          <View style={[styles.illustration, { borderColor: colors.accent, backgroundColor: colors.cardSurface, shadowColor: colors.accent }]}>
            <IconComponent color={colors.accent} size={64} strokeWidth={1.5} />
          </View>
        </View>

        <Animated.Text 
          entering={SlideInDown.duration(500).delay(100)}
          style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.md, textAlign: 'center' }]}
        >
          {slide.title}
        </Animated.Text>
        
        <Animated.Text 
          entering={SlideInDown.duration(500).delay(200)}
          style={[typography.body1, { color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.xl, lineHeight: 26 }]}
        >
          {slide.description}
        </Animated.Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { 
                  backgroundColor: currentSlide === index ? colors.accent : colors.border,
                  width: currentSlide === index ? 24 : 8
                }
              ]}
            />
          ))}
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={handleSkip} style={{ padding: 10 }}>
            <Text style={[typography.button, { color: colors.textSecondary }]}>SKIP</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.nextButton, { backgroundColor: colors.accent }]} 
            onPress={handleNext}
          >
            <Text style={[typography.button, { color: '#000000' }]}>
              {currentSlide === slides.length - 1 ? "GET STARTED" : "NEXT"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  illustrationContainer: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  illustration: {
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: width * 0.225,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  footer: { padding: 30, paddingBottom: 50 },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40 },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4, transition: 'all 0.3s ease' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextButton: { paddingHorizontal: 30, paddingVertical: 14, borderRadius: 30, shadowColor: '#00ffcc', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 }
});
