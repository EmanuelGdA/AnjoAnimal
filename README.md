# Anjo Animal 🐾

> Aplicativo de gestão e denúncia de maus-tratos a animais.

O **Anjo Animal** é uma solução mobile completa para modernizar o processo de fiscalização de denúncias de proteção animal. O sistema permite o registro geolocalizado, acompanhamento de casos (CRM), geração de relatórios oficiais e análise estatística.

---

## 📱 Funcionalidades

### 🚨 Para o Cidadão / Fiscalização

- **Registro de Denúncias:** Formulário intuitivo com fotos e classificação de urgência.
- **Geolocalização Automática:** Captura o endereço exato via GPS ou busca por CEP/Rua.
- **Upload de Evidências:** Galeria de fotos integrada (armazenamento otimizado em Base64).

### 🏢 Para o Gabinete (Gestão)

- **Dashboard de Estatísticas:** Gráficos em tempo real (Casos resolvidos, bairros com mais incidência).
- **Mapa de Calor:** Visualização de todas as denúncias no mapa da cidade.
- **CRM de Tratativas:** Histórico completo de visitas (timeline), com opção de excluir registros errados.
- **Comunicação Direta:** Botão de WhatsApp integrado para contatar o denunciante com um clique.
- **Exportação Oficial:** Geração de relatórios completos em PDF prontos para envio ao Ministério Público ou Prefeitura.
- **Painel Admin:** Alteração de status (Pendente 🟡, Em Análise 🔵, Resolvido 🟢) e exclusão de casos.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi desenvolvido utilizando as melhores práticas do ecossistema React Native.

- **Frontend:** [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/).
- **Backend (Baas):** [Firebase](https://firebase.google.com/) (Google).
  - **Authentication:** Sistema de login seguro e recuperação de senha.
  - **Firestore Database:** Banco de dados NoSQL em tempo real.
- **Mapas:** `react-native-maps` e `expo-location`.
- **Documentos:** `expo-print` e `expo-sharing` (Geração de PDF).
- **Mídia:** `expo-image-picker`.

---

## 📂 Estrutura do Projeto

A arquitetura foi pensada para ser escalável e de fácil manutenção:

```bash
AnjoAnimal/
├── src/
│   ├── components/    # Botões, Cards e elementos visuais reutilizáveis
│   ├── screens/       # Telas do aplicativo (Login, Home, Detalhes, Mapa, Stats)
│   ├── services/      # Configuração do Firebase e Funções da API
│   ├── utils/         # Temas, cores e constantes globais
│   └── hooks/         # Lógica de estado (se houver)
├── App.js             # Ponto de entrada e Navegação
├── app.json           # Configurações do Expo
└── package.json       # Dependências
```
