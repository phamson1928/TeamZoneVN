import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './src/navigation';
import { theme } from './src/theme';
import { AlertProvider } from './src/components/AlertProvider';

const queryClient = new QueryClient();

function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AlertProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor={theme.colors.background}
          />
          <AppNavigator />
        </AlertProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
