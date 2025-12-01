import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Dimensions, Image, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../services/api';
import { auth } from '../services/firebaseConfig';
import { COLORS, URGENCY_COLORS } from '../utils/theme';

export default function DetailScreen({ navigation, route }) {
  const { report } = route.params;
  
  const [currentStatus, setCurrentStatus] = useState(report.status);
  
  // Estado das visitas
  const [visits, setVisits] = useState(report.visits || []);
  const [visitModalVisible, setVisitModalVisible] = useState(false);
  const [newVisitText, setNewVisitText] = useState('');
  
  // Estado das fotos
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const imagesList = report.images || (report.image ? [report.image] : []);

  const openMaps = () => {
    const query = encodeURIComponent(`${report.address}, Curitiba - PR`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const openFullScreen = (imgUrl) => {
    setSelectedImage(imgUrl);
    setModalVisible(true);
  };

  // Botão geral de contato (iniciar conversa)
  const handleContactWhistleblower = () => {
    if (!report.phone) {
        Alert.alert("Indisponível", "Esta denúncia não possui telefone cadastrado.");
        return;
    }
    const cleanNumber = report.phone.replace(/\D/g, ''); 
    const message = `Olá ${report.name || ''}, somos do gabinete da vereadora Andressa. Sobre sua denúncia (Prot. ${report.protocol})...`;
    Linking.openURL(`whatsapp://send?phone=55${cleanNumber}&text=${encodeURIComponent(message)}`);
  };

  // --- NOVA FUNÇÃO: ENVIAR TRATATIVA ESPECÍFICA ---
  const handleShareVisit = (visitText) => {
    if (!report.phone) {
      Alert.alert("Erro", "O denunciante não cadastrou telefone.");
      return;
    }

    const cleanNumber = report.phone.replace(/\D/g, '');
    
    // Monta a mensagem automática
    const message = `🏛️ *Atualização Gabinete Ver. Andressa*\n\nOlá ${report.name || ''}, temos uma novidade sobre o protocolo *${report.protocol}*:\n\n"${visitText}"\n\nQualquer dúvida, estamos à disposição!`;

    Linking.openURL(`whatsapp://send?phone=55${cleanNumber}&text=${encodeURIComponent(message)}`);
  };
  // -----------------------------------------------

  const handleExportPDF = async () => {
    const visitsHtml = visits.length > 0 ? visits.map(v => `
      <div style="background-color: #f9f9f9; padding: 10px; margin-bottom: 5px; border-left: 3px solid #2E86C1;">
        <p style="margin: 0; font-size: 10px; color: grey;">${new Date(v.date).toLocaleString()} - ${v.author}</p>
        <p style="margin: 5px 0 0 0;">${v.description}</p>
      </div>
    `).join('') : '<p>Nenhuma visita registrada.</p>';

    const html = `
      <html>
        <body style="font-family: Helvetica, Arial; padding: 20px;">
          <h1 style="color: #2E86C1;">Denúncia Anjo Animal</h1>
          <p><strong>Protocolo:</strong> ${report.protocol}</p>
          <hr />
          <h3>Status: ${currentStatus}</h3>
          <p><strong>Endereço:</strong> ${report.address} - ${report.region}</p>
          
          <h3>Dados Internos</h3>
          <p><strong>Origem:</strong> ${report.origin}</p>
          <p><strong>Denunciante:</strong> ${report.name || 'Anônimo'}</p>
          <p><strong>Telefone:</strong> ${report.phone || 'Não informado'}</p>

          <h3>Descrição Inicial</h3>
          <p style="background-color: #f0f0f0; padding: 10px;">${report.description}</p>
          
          <h3>Histórico de Visitas / Tratativas</h3>
          ${visitsHtml}

          <h3>Evidências</h3>
          ${imagesList.length > 0 
            ? imagesList.map(img => `<img src="${img}" style="width: 100%; max-height: 300px; object-fit: contain; margin-bottom: 10px;" />`).join('') 
            : '<p>Sem fotos.</p>'
          }
        </body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const handleChangeStatus = () => {
    Alert.alert(
      "Atualizar Status", "Qual a situação atual?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "🟡 Em Análise", onPress: () => updateStatusDB("Em Análise") },
        { text: "🟢 Resolvido", onPress: () => updateStatusDB("Resolvido") },
        { text: "🔴 Pendente", onPress: () => updateStatusDB("Pendente") },
      ]
    );
  };

  const updateStatusDB = async (newStatus) => {
    const success = await api.updateStatus(report.id, newStatus);
    if (success) {
      setCurrentStatus(newStatus);
      Alert.alert("Sucesso", `Status alterado para: ${newStatus}`);
    }
  };
  
  // Função para apagar uma visita específica
  const handleDeleteVisit = (visitToDelete) => {
    Alert.alert(
      "Apagar Registro",
      "Tem certeza que deseja apagar essa tratativa do histórico?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Apagar", 
          style: "destructive",
          onPress: async () => {
            const success = await api.removeVisit(report.id, visitToDelete);
            if (success) {
              // Atualiza a lista na tela instantaneamente removendo o item apagado
              setVisits(visits.filter(v => v !== visitToDelete));
              Alert.alert("Apagado", "Registro removido com sucesso.");
            } else {
              Alert.alert("Erro", "Não foi possível remover.");
            }
          }
        }
      ]
    );
  };

  const handleSaveVisit = async () => {
    if (!newVisitText.trim()) return;

    const userEmail = auth.currentUser?.email || 'Equipe';
    const result = await api.addVisit(report.id, newVisitText, userEmail);

    if (result.success) {
      setVisits([...visits, result.visit]); 
      setNewVisitText('');
      setVisitModalVisible(false);
      
      // Pergunta se já quer enviar para o denunciante
      if (report.phone) {
        Alert.alert(
            "Registrado!", 
            "Deseja enviar essa atualização para o denunciante agora?",
            [
                { text: "Não", style: "cancel" },
                { text: "Enviar no WhatsApp", onPress: () => handleShareVisit(result.visit.description) }
            ]
        );
      } else {
        Alert.alert("Registrado", "Visita adicionada ao histórico.");
      }

    } else {
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Excluir Denúncia", "Tem certeza?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
            const success = await api.deleteReport(report.id);
            if (success) navigation.goBack();
          }
        }
      ]
    );
  };
   
  return (
    <ScrollView style={styles.container}>
      
      {/* CARROSSEL */}
      {imagesList.length > 0 ? (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
          {imagesList.map((img, index) => (
            <TouchableOpacity key={index} onPress={() => openFullScreen(img)} activeOpacity={0.9}>
              <Image source={{ uri: img }} style={styles.image} resizeMode="cover" />
              <View style={styles.photoCount}><Text style={styles.photoCountText}>{index + 1} / {imagesList.length}</Text></View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noImage}>
          <Ionicons name="image-outline" size={50} color={COLORS.textLight} />
          <Text style={styles.noImageText}>Sem fotos registradas</Text>
        </View>
      )}

      {/* MODAL FOTO TELA CHEIA */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={30} color="#FFF" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
        </View>
      </Modal>

      {/* MODAL NOVA VISITA */}
      <Modal visible={visitModalVisible} transparent={true} animationType="slide">
        <View style={styles.inputModalContainer}>
          <View style={styles.inputModalContent}>
            <Text style={styles.inputModalTitle}>Registrar Visita / Tratativa</Text>
            <TextInput 
              style={styles.modalInput}
              placeholder="Descreva o que foi feito..."
              multiline
              value={newVisitText}
              onChangeText={setNewVisitText}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setVisitModalVisible(false)}>
                <Text style={{color: COLORS.text}}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveVisit}>
                <Text style={{color: '#FFF', fontWeight: 'bold'}}>Salvar Registro</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.protocol}>Protocolo #{report.protocol}</Text>
          <View style={[styles.badge, { backgroundColor: URGENCY_COLORS[report.urgency] }]}>
            <Text style={styles.badgeText}>{report.urgency}</Text>
          </View>
        </View>

        <View style={[styles.section, { borderLeftWidth: 5, borderLeftColor: currentStatus === 'Resolvido' ? COLORS.success : COLORS.primary }]}>
          <Text style={styles.label}>Status Atual:</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: currentStatus === 'Resolvido' ? COLORS.success : COLORS.text }}>
            {currentStatus}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Endereço:</Text>
          <Text style={styles.value}>{report.address} - {report.region}</Text>
          <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
            <Ionicons name="map" size={20} color="#FFF" />
            <Text style={styles.mapButtonText}>Abrir Rota no GPS</Text>
          </TouchableOpacity>
        </View>

        {report.phone ? (
            <TouchableOpacity style={styles.whatsappButton} onPress={handleContactWhistleblower}>
                <Ionicons name="logo-whatsapp" size={24} color="#FFF" />
                <Text style={styles.buttonText}>Contatar Denunciante</Text>
            </TouchableOpacity>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.label}>Descrição Original:</Text>
          <Text style={styles.value}>{report.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Dados Internos:</Text>
          <Text style={styles.small}>Origem: {report.origin}</Text>
          <Text style={styles.small}>Denunciante: {report.name || 'Anônimo'}</Text>
          <Text style={styles.small}>Telefone: {report.phone || 'Não informado'}</Text>
        </View>

        {/* --- SEÇÃO DE HISTÓRICO DE VISITAS (COM BOTÃO WHATSAPP) --- */}
        <View style={styles.historySection}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: 10}}>
            <Text style={styles.adminTitle}>Histórico de Tratativas</Text>
            <TouchableOpacity onPress={() => setVisitModalVisible(true)}>
              <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>+ Adicionar</Text>
            </TouchableOpacity>
          </View>
          
          {visits.length === 0 && <Text style={{color: COLORS.textLight, fontStyle:'italic'}}>Nenhuma visita registrada ainda.</Text>}
          
          {visits.map((visit, index) => (
            <View key={index} style={styles.visitCard}>
              <View style={styles.visitHeader}>
                {/* Lado Esquerdo: Data e Autor */}
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.textLight} />
                    <Text style={styles.visitDate}>
                    {new Date(visit.date).toLocaleDateString()} às {new Date(visit.date).toLocaleTimeString().slice(0,5)}
                    </Text>
                    <Text style={styles.visitAuthor}>({visit.author.split('@')[0]})</Text>
                </View>
                
                {/* Lado Direito: Botão Lixeira */}
                <TouchableOpacity onPress={() => handleDeleteVisit(visit)}>
                    <Ionicons name="trash-outline" size={16} color="#E74C3C" />
                </TouchableOpacity>
              </View>
              <Text style={styles.visitText}>{visit.description}</Text>
              
              {/* BOTÃO DE COMPARTILHAR VISITA (SÓ SE TIVER TELEFONE) */}
              {report.phone && (
                  <TouchableOpacity style={styles.shareVisitButton} onPress={() => handleShareVisit(visit.description)}>
                      <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                      <Text style={styles.shareVisitText}>Enviar ao Denunciante</Text>
                  </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
        {/* --------------------------------------------------------- */}
        
        <Text style={styles.adminTitle}>Painel Administrativo</Text>
        
        <View style={styles.adminRow}>
          <TouchableOpacity style={styles.statusButton} onPress={handleChangeStatus}>
            <Ionicons name="create-outline" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Mudar Status</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Excluir</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.pdfButton} onPress={handleExportPDF}>
          <Ionicons name="document-text" size={24} color="#FFF" />
          <Text style={styles.buttonText}>Gerar Relatório PDF</Text>
        </TouchableOpacity>

      </View>
      <View style={{height: 30}} />
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  carousel: { height: 250, backgroundColor: '#000' },
  image: { width: width, height: 250 },
  photoCount: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  photoCountText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  noImage: { width: '100%', height: 150, backgroundColor: '#E1E8EB', justifyContent: 'center', alignItems: 'center' },
  noImageText: { color: COLORS.textLight, marginTop: 5 },
  
  modalContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  fullScreenImage: { width: '100%', height: '100%' },
  closeButton: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  
  inputModalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  inputModalContent: { backgroundColor: '#FFF', borderRadius: 10, padding: 20, elevation: 5 },
  inputModalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: COLORS.primary },
  modalInput: { backgroundColor: '#F4F6F7', borderRadius: 8, padding: 10, height: 100, textAlignVertical: 'top', marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
  modalCancel: { padding: 10 },
  modalSave: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 8 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  section: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 1 },
  protocol: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  badge: { padding: 6, borderRadius: 5 },
  badgeText: { color: '#FFF', fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: 'bold', color: COLORS.textLight, marginBottom: 5 },
  value: { fontSize: 16, color: COLORS.text },
  small: { fontSize: 14, color: COLORS.text, marginBottom: 2 },
  
  mapButton: { marginTop: 15, backgroundColor: COLORS.secondary, flexDirection: 'row', padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  mapButtonText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
  
  historySection: { marginBottom: 20, marginTop: 10 },
  visitCard: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: COLORS.secondary, elevation: 1 },
  visitHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  visitDate: { fontSize: 12, color: COLORS.textLight, marginLeft: 5, marginRight: 5 },
  visitAuthor: { fontSize: 12, color: COLORS.primary, fontWeight: 'bold' },
  visitText: { fontSize: 14, color: COLORS.text },
  
  // Estilo do botãozinho de compartilhar visita
  shareVisitButton: { flexDirection: 'row', alignItems: 'center', marginTop: 10, alignSelf: 'flex-end', padding: 5, backgroundColor: '#ECFDF5', borderRadius: 5, borderWidth: 1, borderColor: '#25D366' },
  shareVisitText: { color: '#25D366', fontSize: 10, fontWeight: 'bold', marginLeft: 5 },

  whatsappButton: { backgroundColor: '#25D366', padding: 15, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  adminTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginTop: 10, marginBottom: 10 },
  adminRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statusButton: { flex: 1, backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  deleteButton: { flex: 1, backgroundColor: '#7f8c8d', padding: 15, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }, 
  pdfButton: { backgroundColor: '#E74C3C', padding: 15, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  buttonText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8, fontSize: 14 },
});