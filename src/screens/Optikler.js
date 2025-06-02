import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function Optikler() {
  const saveImageToGallery = async (assetModule) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Fotoğrafları indirmek için medya erişim izni gerekli.');
        return;
      }

      const asset = Asset.fromModule(assetModule);
      await asset.downloadAsync();

      const localUri = asset.localUri || asset.uri;
      if (!localUri) throw new Error('Dosya yolu bulunamadı.');

      const fileName = localUri.split('/').pop();
      const destPath = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.copyAsync({ from: localUri, to: destPath });

      const assetSaved = await MediaLibrary.createAssetAsync(destPath);

      if (Platform.OS === 'android') {
        const album = await MediaLibrary.getAlbumAsync('Download');
        if (album == null) {
          await MediaLibrary.createAlbumAsync('Download', assetSaved, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([assetSaved], album, false);
        }
      }

      Alert.alert('Başarılı', 'Form fotoğrafı galeriye kaydedildi!');
    } catch (err) {
      Alert.alert('Hata', 'Fotoğraf indirilemedi. İzin verilmedi veya dosya okunamadı.');
    }
  };

  const forms = [
    { label: '10 Soruluk Optik', source: require('../../assets/Form10.png') },
    { label: '15 Soruluk Optik', source: require('../../assets/Form15.png') },
    { label: '20 Soruluk Optik', source: require('../../assets/Form20.png') },
    { label: '25 Soruluk Optik', source: require('../../assets/Form25.png') },
    { label: '30 Soruluk Optik', source: require('../../assets/Form30.png') },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Formlar</Text>

      {forms.map((form, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => saveImageToGallery(form.source)}
        >
          <Text style={styles.buttonText}>{form.label} - İndir</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  button: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    backgroundColor:'#0066ff',
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
  },
});
