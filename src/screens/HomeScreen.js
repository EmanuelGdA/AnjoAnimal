import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { signOut } from 'firebase/auth'; // Função de sair
import { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ReportCard from '../components/ReportCard';
import { api } from '../services/api';
import { auth } from '../services/firebaseConfig'; // Importa o Auth
import { COLORS } from '../utils/theme';

export default function HomeScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false); // Estado para o "Puxar para atualizar"

  // Função de Logout (Definida antes para ser usada no useLayoutEffect)
  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair do sistema?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive',
        onPress: () => {
          signOut(auth).then(() => {
            navigation.replace('Login');
          }).catch(error => console.error(error));
        }
      }
    ]);
  };

  // Configura os Botões no topo da tela (Estatísticas + Mapa + Logout)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          
          {/* --- BOTÃO NOVO: ESTATÍSTICAS (Gráfico) --- */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Stats')} 
            style={{ marginRight: 15 }}
          >
            <Ionicons name="bar-chart-outline" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* --- BOTÃO: IR PARA O MAPA --- */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Map')} 
            style={{ marginRight: 15 }}
          >
            <Ionicons name="map-outline" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* --- BOTÃO: SAIR --- */}
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 10 }}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  // Carrega os dados
  const loadReports = async () => {
    const data = await api.getReports();
    setReports(data);
    setFilteredReports(data);
  };

  // Carrega ao entrar na tela
  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [])
  );

  // Função chamada quando puxa a lista para baixo
  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (text) {
      const filtered = reports.filter(item => 
        (item.protocol && item.protocol.includes(text)) || 
        (item.description && item.description.toLowerCase().includes(text.toLowerCase())) ||
        (item.address && item.address.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredReports(filtered);
    } else {
      setFilteredReports(reports);
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra de Boas-vindas */}
      <View style={styles.welcomeBar}>
        <Text style={styles.welcomeText}>
          Olá, {auth.currentUser?.email || 'Usuário'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Buscar por protocolo, endereço..."
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ReportCard item={item} onPress={() => navigation.navigate('Details', { report: item })} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma denúncia encontrada.</Text>}
        // Adiciona o "Puxar para Atualizar"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('NewReport')}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  welcomeBar: { paddingHorizontal: 16, paddingTop: 10 },
  welcomeText: { fontSize: 14, color: COLORS.text, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', margin: 16, marginTop: 10, paddingHorizontal: 10, borderRadius: 8, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12 },
  listContent: { paddingHorizontal: 16, paddingBottom: 80 },
  emptyText: { textAlign: 'center', marginTop: 50, color: COLORS.textLight },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: COLORS.primary, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 },
});