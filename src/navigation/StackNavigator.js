import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnaSayfa from '../screens/AnaSayfa';
import AnswerKeyScreen from '../screens/AnswerKeyScreen';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Upload">
      <Stack.Screen name="Upload" component={AnaSayfa} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default StackNavigator;