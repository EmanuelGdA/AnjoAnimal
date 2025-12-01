import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../services/api';
import { COLORS } from '../utils/theme';

// Tenta usar o ícone do app como logo
const logoImg = { uri: 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png' }; 

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    const response = await api.login(email, password);
    setLoading(false);

    if (response.error) {
      Alert.alert('Atenção', response.error);
    } else {
      navigation.replace('Home');
    }
  };

  // --- FUNÇÃO: RECUPERAR SENHA ---
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Atenção', 'Por favor, digite seu e-mail no campo acima para resetar a senha.');
      return;
    }

    Alert.alert(
      'Recuperar Senha',
      `Enviar link de redefinição para: ${email}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Enviar', 
          onPress: async () => {
            const response = await api.resetPassword(email);
            if (response.success) {
              Alert.alert('Sucesso', 'Verifique seu e-mail (inclusive a caixa de spam) para criar uma nova senha.');
            } else {
              Alert.alert('Erro', response.error);
            }
          }
        }
      ]
    );
  };
  // ------------------------------

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        
        {/* LOGO E TÍTULO */}
        <View style={styles.header}>
          <Image source={logoImg} style={styles.logo} />
          <Text style={styles.title}>Anjo Animal 🐾</Text>
          <Text style={styles.subtitle}>Gabinete Ver. Andressa Bianchessi</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>E-mail de Acesso</Text>
          <TextInput 
            style={styles.input} 
            placeholder="exemplo@vereador.com" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput 
            style={styles.input} 
            placeholder="••••••" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
          />
          
          {/* BOTÃO ESQUECI A SENHA */}
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotLink}>
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Acessar Sistema</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>v1.0.0 - Versão Oficial</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', padding: 25 },
  
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 100, height: 100, borderRadius: 20, marginBottom: 15 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
  subtitle: { fontSize: 16, color: COLORS.textLight, textAlign: 'center', marginTop: 5 },

  form: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, elevation: 2 },
  label: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginBottom: 5 },
  input: { backgroundColor: '#F4F6F7', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#E1E8EB' },
  
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  forgotLink: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: COLORS.primary, fontSize: 14 },

  footer: { textAlign: 'center', color: COLORS.textLight, fontSize: 12, marginTop: 40, opacity: 0.6 }
});