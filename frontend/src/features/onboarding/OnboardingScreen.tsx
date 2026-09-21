import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Agentic AI Outreach',
    description: 'ProReach automates professional communication with personalized AI drafting and native SMTP sending.',
  },
  {
    id: 2,
    title: 'Local Privacy First',
    description: 'Your data, your device. We replaced cloud accounts with Local Profiles. Your keys and history stay with you.',
  },
  {
    id: 3,
    title: 'Intelligent Drafting',
    description: 'Connect your Gemini API key and let our AI engine analyze job descriptions to generate the perfect pitch.',
  },
  {
    id: 4,
    title: 'Direct SMTP Delivery',
    description: 'Bypass generic email clients. Send beautifully formatted HTML emails directly from your Gmail account.',
  },
  {
    id: 5,
    title: 'Ready for Launch',
    description: 'Create your first professional identity profile and step into the future of outreach.',
  }
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { themeColors, typography, spacing } = useTheme();

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

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        {/* Mocked Illustration Area for futuristic aesthetic */}
        <View style={[styles.illustration, { borderColor: themeColors.aiAccent, backgroundColor: themeColors.elevatedSurface }]}>
          <Text style={{ color: themeColors.aiAccent, fontSize: 40 }}>★</Text>
        </View>

        <Text style={[typography.h1, { color: themeColors.textPrimary, marginBottom: spacing.md, textAlign: 'center' }]}>
          {slide.title}
        </Text>
        <Text style={[typography.body1, { color: themeColors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.xl }]}>
          {slide.description}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: currentSlide === index ? themeColors.aiAccent : themeColors.border }
              ]}
            />
          ))}
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={[typography.button, { color: themeColors.textSecondary }]}>SKIP</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.nextButton, { backgroundColor: themeColors.aiAccent }]} 
            onPress={handleNext}
          >
            <Text style={[typography.button, { color: '#000000' }]}>
              {currentSlide === slides.length - 1 ? "CREATE PROFILE" : "NEXT"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  footer: {
    padding: 30,
    paddingBottom: 50,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  }
});
