import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { COLORS } from '../utils/theme';

export default function StatsScreen() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    solved: 0,
    pending: 0,
    topRegion: 'Nenhuma',
    urgentCount: 0
  });

  useFocusEffect(
    useCallback(() => {
      calculateStats();
    }, [])
  );

  const calculateStats = async () => {
    setLoading(true);
    const reports = await api.getReports();

    // 1. Contagens Básicas
    const total = reports.length;
    const solved = reports.filter(r => r.status === 'Resolvido').length;
    const pending = reports.filter(r => r.status === 'Pendente').length;
    const urgent = reports.filter(r => r.urgency === 'Emergência' || r.urgency === 'Alta').length;

    // 2. Descobrir o Bairro com mais denúncias
    const regionCount = {};
    reports.forEach(r => {
      regionCount[r.region] = (regionCount[r.region] || 0) + 1;
    });
    
    // Ordena para achar o maior
    let topRegionName = '-';
    let maxCount = 0;
    Object.entries(regionCount).forEach(([region, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topRegionName = region;
      }
    });

    setStats({
      total,
      solved,
      pending,
      topRegion: topRegionName,
      urgentCount: urgent
    });
    setLoading(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={calculateStats} />}
    >
      <Text style={styles.title}>Resumo do Gabinete</Text>
      <Text style={styles.subtitle}>Dados em tempo real</Text>

      {/* CARDS PRINCIPAIS */}
      <View style={styles.row}>
        <View style={[styles.card, { backgroundColor: COLORS.primary }]}>
          <Ionicons name="folder-open-outline" size={24} color="#FFF" />
          <Text style={styles.cardValue}>{stats.total}</Text>
          <Text style={styles.cardLabel}>Total de Denúncias</Text>
        </View>

        <View style={[styles.card, { backgroundColor: COLORS.success }]}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#FFF" />
          <Text style={styles.cardValue}>{stats.solved}</Text>
          <Text style={styles.cardLabel}>Casos Resolvidos</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, { backgroundColor: '#E67E22' }]}>
          <Ionicons name="warning-outline" size={24} color="#FFF" />
          <Text style={styles.cardValue}>{stats.urgentCount}</Text>
          <Text style={styles.cardLabel}>Alta Urgência</Text>
        </View>

        <View style={[styles.card, { backgroundColor: '#95A5A6' }]}>
          <Ionicons name="time-outline" size={24} color="#FFF" />
          <Text style={styles.cardValue}>{stats.pending}</Text>
          <Text style={styles.cardLabel}>Pendentes</Text>
        </View>
      </View>

      {/* DESTAQUE DO BAIRRO */}
      <View style={styles.highlightCard}>
        <View>
          <Text style={styles.highlightTitle}>Bairro com mais casos</Text>
          <Text style={styles.highlightValue}>{stats.topRegion}</Text>
          <Text style={styles.highlightDesc}>Maior incidência de denúncias</Text>
        </View>
        <Ionicons name="location" size={40} color={COLORS.primary} />
      </View>

      {/* BARRA DE PROGRESSO VISUAL (META) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Taxa de Resolução</Text>
        <View style={styles.progressBarBg}>
          <View style={[
            styles.progressBarFill, 
            { width: stats.total > 0 ? `${(stats.solved / stats.total) * 100}%` : '0%' }
          ]} />
        </View>
        <Text style={styles.progressText}>
          {stats.total > 0 ? ((stats.solved / stats.total) * 100).toFixed(1) : 0}% dos casos resolvidos
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textLight, marginBottom: 20 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  card: { width: '48%', padding: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  cardValue: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginVertical: 5 },
  cardLabel: { fontSize: 12, color: '#FFF', opacity: 0.9 },

  highlightCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, marginBottom: 20 },
  highlightTitle: { color: COLORS.textLight, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  highlightValue: { color: COLORS.text, fontSize: 22, fontWeight: 'bold', marginTop: 5 },
  highlightDesc: { color: COLORS.success, fontSize: 12, marginTop: 2 },

  section: { marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
  progressBarBg: { height: 15, backgroundColor: '#E0E0E0', borderRadius: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.success },
  progressText: { textAlign: 'right', marginTop: 5, color: COLORS.textLight, fontSize: 12 },
});