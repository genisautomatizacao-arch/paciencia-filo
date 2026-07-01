import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MiniGamesHubScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>MUNDO DA{'\n'}<Text style={styles.highlight}>FILÓ</Text></Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea}>
        <Text style={styles.subtitle}>Desafios para a Mente e o Espírito</Text>
        
        <View style={styles.grid}>
          {/* Dominó Card */}
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: '#4a3018' }]} // Wood color
            onPress={() => navigation.navigate('DominoesGame')}
          >
            <Text style={styles.cardIcon}>🎲</Text>
            <Text style={styles.cardTitle}>Dominó Bíblico</Text>
            <Text style={styles.cardDesc}>Conecte as pedras contra a Inteligência Artificial.</Text>
          </TouchableOpacity>

          {/* Memory Game Card */}
          <TouchableOpacity style={[styles.card, { backgroundColor: '#1e3c72' }]}>
            <Text style={styles.cardIcon}>🧠</Text>
            <Text style={styles.cardTitle}>Atenção Seletiva</Text>
            <Text style={styles.cardDesc}>Treine sua memória com cartas viradas.</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>EM BREVE</Text></View>
          </TouchableOpacity>

          {/* Word Search Card */}
          <TouchableOpacity style={[styles.card, { backgroundColor: '#800020' }]}>
            <Text style={styles.cardIcon}>🔍</Text>
            <Text style={styles.cardTitle}>Caça-Palavras</Text>
            <Text style={styles.cardDesc}>Encontre os livros da Bíblia e promessas escondidas.</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>EM BREVE</Text></View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05131f', // Dark blueish background for neuro vibe
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
  },
  highlight: {
    color: '#3498db', // A vibrant blue for the "Neuro" vibe highlight
  },
  scrollArea: {
    padding: 20,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 30,
    textAlign: 'center',
  },
  grid: {
    gap: 15,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  badge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#ccc',
    fontSize: 10,
    fontWeight: 'bold',
  }
});
