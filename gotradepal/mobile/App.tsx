import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { SplashScreen, WelcomeScreen, AuthScreen, ProfileSetupScreen, AssessmentScreen, MainTabs } from './src/screens';

const Stack = createNativeStackNavigator();
export default function App() {
  const scheme = useColorScheme();
  return <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen}/>
      <Stack.Screen name="Welcome" component={WelcomeScreen}/>
      <Stack.Screen name="Auth" component={AuthScreen}/>
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen}/>
      <Stack.Screen name="Assessment" component={AssessmentScreen}/>
      <Stack.Screen name="Main" component={MainTabs}/>
    </Stack.Navigator>
  </NavigationContainer>;
}
