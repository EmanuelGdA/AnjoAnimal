import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location'; 
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../services/api';
import { COLORS, CURITIBA_REGIONS } from '../utils/theme';

export default function NewReportScreen({ navigation }) {
  const [images, setImages] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    origin: 'WhatsApp',
    name: '',
    phone: '',
    description: '',
    address: '',
    region: CURITIBA_REGIONS[0],
    urgency: 'Baixa',
  });

  // --- MÁSCARA DE TELEFONE (NOVA FUNÇÃO) ---
  const handlePhoneChange = (text) => {
    // 1. Remove tudo que não é número
    let value = text.replace(/\D/g, ''); 
    
    // 2. Limita a 11 números
    value = value.substring(0, 11);

    // 3. Aplica a máscara (XX) XXXXX-XXXX
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
        value = value.replace(/^(\d*)/, '($1'); 
    }

    setForm({ ...form, phone: value });
  };
  // ----------------------------------------

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limite', 'Você pode adicionar no máximo 5 fotos.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.2,
      base64: true,
    });

    if (!result.canceled) {
      const imageCode = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImages([...images, imageCode]); 
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    // --- BLOQUEIO DE SEGURANÇA ---
    if (loading) return; // Se já estiver carregando, ignora novos cliques
    // -----------------------------

    if (!form.description || !form.address) {
      Alert.alert('Atenção', 'Preencha descrição e endereço.');
      return;
    }

    setLoading(true);

    let exactLocation = null;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        const geocoded = await Location.geocodeAsync(`${form.address}, Curitiba - PR`);
        if (geocoded.length > 0) {
          exactLocation = {
            latitude: geocoded[0].latitude,
            longitude: geocoded[0].longitude
          };
        }
      }
    } catch (error) {
      console.log("Erro ao buscar coordenadas exatas:", error);
    }

    await api.createReport({ ...form, exactLocation }, images);
    
    setLoading(false);

    Alert.alert('Sucesso', 'Denúncia registrada!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const updateForm = (key, value) => setForm({ ...form, [key]: value });

  return (
    <ScrollView style={styles.container}>
      
      <View style={styles.photosArea}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
            <Ionicons name="camera" size={30} color={COLORS.textLight} />
            <Text style={styles.addPhotoText}>{images.length}/5</Text>
          </TouchableOpacity>
          {images.map((img, index) => (
            <View key={index} style={styles.photoWrapper}>
              <Image source={{ uri: img }} style={styles.thumbnail} />
              <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                <Ionicons name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.label}>Canal de Origem</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={form.origin} onValueChange={val => updateForm('origin', val)}>
          <Picker.Item label="WhatsApp" value="WhatsApp" />
          <Picker.Item label="Telefone" value="Telefone" />
          <Picker.Item label="E-mail" value="E-mail" />
          <Picker.Item label="Presencial" value="Presencial" />
        </Picker>
      </View>

      <Text style={styles.label}>Urgência</Text>
      <View style={styles.row}>
        {['Baixa', 'Média', 'Alta', 'Emergência'].map(level => (
          <TouchableOpacity 
            key={level}
            style={[styles.chip, form.urgency === level && styles.chipSelected]}
            onPress={() => updateForm('urgency', level)}
          >
            <Text style={[styles.chipText, form.urgency === level && styles.chipTextSelected]}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Nome do Denunciante (Opcional)</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Nome"
        value={form.name}
        onChangeText={val => updateForm('name', val)}
      />

      <Text style={styles.label}>Telefone para Contato (Opcional)</Text>
      <TextInput 
        style={styles.input} 
        placeholder="(41) 99999-9999"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={handlePhoneChange} // <--- AQUI CHAMA A MÁSCARA
        maxLength={15} // Limita o tamanho para não digitar demais
      />

      <Text style={styles.label}>Descrição *</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        multiline 
        placeholder="Descreva..."
        value={form.description}
        onChangeText={val => updateForm('description', val)}
      />

      <Text style={styles.label}>Endereço Completo (Rua e Número) *</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ex: Rua XV de Novembro, 1000"
        value={form.address}
        onChangeText={val => updateForm('address', val)}
      />

      <Text style={styles.label}>Bairro / Região</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={form.region} onValueChange={val => updateForm('region', val)}>
          {CURITIBA_REGIONS.map(region => (
            <Picker.Item key={region} label={region} value={region} />
          ))}
        </Picker>
      </View>

      {/* --- BOTÃO COM FEEDBACK VISUAL --- */}
      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.5 }]} // Fica transparente se carregando
        onPress={handleSubmit} 
        disabled={loading} // Bloqueia o clique
      >
        {loading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ActivityIndicator color="#FFF" style={{ marginRight: 10 }} />
            <Text style={styles.buttonText}>Salvando...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Registrar Denúncia</Text>
        )}
      </TouchableOpacity>
      {/* ------------------------------- */}

      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  photosArea: { flexDirection: 'row', marginBottom: 20, height: 110 },
  addPhotoButton: { width: 100, height: 100, backgroundColor: '#E1E8EB', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#BDC3C7', marginRight: 10 },
  addPhotoText: { color: COLORS.textLight, fontSize: 12, marginTop: 4 },
  photoWrapper: { position: 'relative', marginRight: 10 },
  thumbnail: { width: 100, height: 100, borderRadius: 10 },
  removeButton: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FFF', borderRadius: 12 },
  label: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DDD' },
  textArea: { height: 80, textAlignVertical: 'top' },
  pickerContainer: { backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#DDD' },
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 30 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E0E0E0', marginBottom: 5 },
  chipSelected: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.text },
  chipTextSelected: { color: '#FFF', fontWeight: 'bold' },
});