import * as React from 'react'; 
import { registerRootComponent } from 'expo'; // 👈 NOVO IMPORT NECESSÁRIO
import { NavigationContainer } from "@react-navigation/native";
import { enableScreens } from 'react-native-screens';
import AppRoutes from "./src/routes/AppRoutes";


enableScreens(); 


function App() {
  return (
    <NavigationContainer>
      <AppRoutes />
    </NavigationContainer>
  );
}


registerRootComponent(App);