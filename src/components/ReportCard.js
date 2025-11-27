import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, URGENCY_COLORS } from '../utils/theme';
import { format } from 'date-fns';

export default function ReportCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: URGENCY_COLORS[item.urgency] }]}>
          <Text style={styles.badgeText}>{item.urgency}</Text>
        </View>
        <Text style={styles.date}>{format(new Date(item.date), 'dd/MM/yyyy HH:mm')}</Text>
      </View>
      
      <Text style={styles.protocol}>Protocolo: {item.protocol}</Text>
      <Text style={styles.address} numberOfLines={1}>📍 {item.address} - {item.region}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

      <View style={styles.footer}>
        <View style={styles.statusContainer}>
          <Ionicons name="information-circle" size={16} color={COLORS.primary} />
          <Text style={styles.status}>{item.status}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  date: { color: COLORS.textLight, fontSize: 12 },
  protocol: { fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  address: { color: COLORS.text, fontSize: 13, marginBottom: 6 },
  description: { color: COLORS.textLight, fontSize: 14, fontStyle: 'italic', marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 8 },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  status: { marginLeft: 4, color: COLORS.primary, fontWeight: '600', fontSize: 12 },
});