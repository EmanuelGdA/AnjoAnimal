export const COLORS = {
  primary: '#2E86C1', // Azul institucional
  secondary: '#F39C12', // Laranja para destaque
  background: '#F4F6F7',
  card: '#FFFFFF',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  danger: '#E74C3C', // Urgência: Emergência
  high: '#E67E22',   // Urgência: Alta
  medium: '#F1C40F', // Urgência: Média
  low: '#27AE60',    // Urgência: Baixa
  success: '#2ECC71',
};

export const URGENCY_COLORS = {
  'Emergência': COLORS.danger,
  'Alta': COLORS.high,
  'Média': COLORS.medium,
  'Baixa': COLORS.low,
};

export const CURITIBA_REGIONS = [
  'Matriz', 'Portão', 'Cajuru', 'Boa Vista', 
  'Boqueirão', 'Pinheirinho', 'CIC', 'Bairro Novo', 
  'Santa Felicidade', 'Tatuquara'
];