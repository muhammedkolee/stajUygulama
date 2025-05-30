import React, { useState } from 'react';
import { StyleSheet, View, Button, Image, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function App() {
  return (
  <View style = {styles.container}>
    <Text style = {styles.textColor}>Merhaba</Text>
  </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  textColor: {
    color: "green"
  }
});