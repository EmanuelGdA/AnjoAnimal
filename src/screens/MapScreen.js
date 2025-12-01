import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { db } from '../services/firebaseConfig'; 
import { collection, getDocs } from 'firebase/firestore';
import { COLORS } from '../utils/theme';

export default function MapScreen() {
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    fetchReportsFromFirebase();
  }, []);

  const fetchReportsFromFirebase = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "denuncias"));
      const reports = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Tenta converter latitude/longitude para número caso venha como texto
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          reports.push({ ...data, lat, lng });
        }
      });

      // Cria os marcadores dinâmicos
      const markersScript = reports.map(report => {
        const titulo = report.titulo || 'Denúncia';
        // Remove aspas simples e quebras de linha para não quebrar o JS do mapa
        const safeTitle = titulo.replace(/["'\n]/g, " "); 
        
        return `L.marker([${report.lat}, ${report.lng}])
          .addTo(map)
          .bindPopup('<b>${safeTitle}</b>');`;
      }).join('\n');

      const finalHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style> body { margin: 0; padding: 0; } #map { height: 100vh; width: 100vw; } </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            // Centraliza no Brasil
            var map = L.map('map').setView([-15.7942, -47.8822], 4);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap'
            }).addTo(map);

            ${markersScript}
          </script>
        </body>
        </html>
      `;

      setHtmlContent(finalHtml);
    } catch (error) {
      console.error("Erro ao carregar mapa:", error);
      Alert.alert("Erro", "Não foi possível carregar as denúncias no mapa.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary || '#000'} />
        <Text style={{ marginTop: 10 }}>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { justifyContent: 'center', alignItems: 'center' },
});