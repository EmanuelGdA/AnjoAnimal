import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { api } from '../services/api';
import { COLORS, URGENCY_COLORS } from '../utils/theme';

// Coordenadas dos bairros (Fallback - Plano B se não achar a rua)
const REGION_COORDINATES = {
  'Matriz': { lat: -25.4284, lng: -49.2733 },
  'Portão': { lat: -25.4740, lng: -49.2941 },
  'Cajuru': { lat: -25.4449, lng: -49.2272 },
  'Boa Vista': { lat: -25.3900, lng: -49.2325 },
  'Boqueirão': { lat: -25.5008, lng: -49.2394 },
  'Pinheirinho': { lat: -25.5126, lng: -49.2965 },
  'CIC': { lat: -25.5060, lng: -49.3270 },
  'Bairro Novo': { lat: -25.5645, lng: -49.2662 },
  'Santa Felicidade': { lat: -25.4057, lng: -49.3330 },
  'Tatuquara': { lat: -25.5562, lng: -49.3374 },
};

const getRandomOffset = () => (Math.random() - 0.5) * 0.005;

export default function MapScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    const data = await api.getReports();
    
    const reportsWithCoords = data.map(report => {
      let lat, lng;

      // 1. Verifica se salvamos a localização exata (Rua certa)
      if (report.exactLocation && report.exactLocation.latitude) {
        lat = report.exactLocation.latitude;
        lng = report.exactLocation.longitude;
      } 
      // 2. Se não, usa o centro do bairro (Plano B)
      else {
        const baseCoord = REGION_COORDINATES[report.region] || REGION_COORDINATES['Matriz'];
        lat = baseCoord.lat + getRandomOffset();
        lng = baseCoord.lng + getRandomOffset();
      }

      return { ...report, latitude: lat, longitude: lng };
    });

    setReports(reportsWithCoords);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -25.4284, // Centro de Curitiba
          longitude: -49.2733,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
      >
        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{ latitude: report.latitude, longitude: report.longitude }}
            pinColor={URGENCY_COLORS[report.urgency]}
          >
            <Callout onPress={() => navigation.navigate('Details', { report })}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{report.urgency}</Text>
                <Text style={styles.calloutText}>{report.description.substring(0, 30)}...</Text>
                <Text style={styles.calloutLink}>Ver detalhes</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legenda:</Text>
        <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: URGENCY_COLORS['Emergência']}]} /><Text>Emergência</Text></View>
        <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: URGENCY_COLORS['Alta']}]} /><Text>Alta</Text></View>
        <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: URGENCY_COLORS['Média']}]} /><Text>Média</Text></View>
        <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: URGENCY_COLORS['Baixa']}]} /><Text>Baixa</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  callout: { width: 150, padding: 5 },
  calloutTitle: { fontWeight: 'bold', marginBottom: 5 },
  calloutText: { fontSize: 12, marginBottom: 5 },
  calloutLink: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12 },
  legend: { position: 'absolute', bottom: 20, left: 20, backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 8, elevation: 5 },
  legendTitle: { fontWeight: 'bold', marginBottom: 5, fontSize: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
});