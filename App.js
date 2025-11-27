import StatsScreen from './src/screens/StatsScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import MapScreen from './src/screens/MapScreen';

// Importação das telas
import DetailScreen from './src/screens/DetailScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import NewReportScreen from './src/screens/NewReportScreen';
import { COLORS } from './src/utils/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Denúncias - Anjo Animal' }} />
        <Stack.Screen name="NewReport" component={NewReportScreen} options={{ title: 'Nova Denúncia' }} />
        <Stack.Screen name="Details" component={DetailScreen} options={{ title: 'Detalhes da Denúncia' }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Mapa de Calor' }} />
        <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Estatísticas' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}