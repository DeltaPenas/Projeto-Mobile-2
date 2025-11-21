import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";  
import ProjetosScreen from "../screens/ProjetosScreen";
import RecoverScreen from "../screens/Recover";

const Stack = createNativeStackNavigator();

export default function AppRoutes() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,   
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Projetos" component={ProjetosScreen}/>
      <Stack.Screen name="Recover" component={RecoverScreen} />
    </Stack.Navigator>
  );
}