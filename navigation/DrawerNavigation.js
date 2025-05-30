import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { View, Text, Image, StyleSheet } from 'react-native'

import Anasayfa from '../screens/AnaSayfa'
import Gecmis from '../screens/Gecmis'
import Ayarlar from '../screens/Ayarlar'
import Hakkinda from '../screens/Hakkinda'

const Drawer = createDrawerNavigator()

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/description.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Optik Okuyucu</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  )
}

export default function DrawerNavigation() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#7d8ba8',
          width: 240,
        },
        headerStyle: {
            backgroundColor: '#7d8ba8',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
        },
        headerShown: true,
        swipeEnabled: true,
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#ccc',
        title: 'Tabs',
      }}
    >
      <Drawer.Screen name="AnaSayfa" component={Anasayfa} options={{ drawerLabel: 'Ana Sayfa',
        drawerIcon: ({ focused }) => (
            <Image
              source={require('../assets/home.png')}
              style={[
                styles.icon,
                { tintColor: focused ? '#fff' : '#ccc' }
              ]}
            />
          )
       }}/>
      <Drawer.Screen name="Gecmis" component={Gecmis} options={{ drawerLabel: 'Geçmiş', 
        drawerIcon: ({ focused }) => (
            <Image
              source={require('../assets/history.png')}
              style={[
                styles.icon,
                { tintColor: focused ? '#fff' : '#ccc' }
              ]}
            />
          )
       }}/>
      <Drawer.Screen name="Ayarlar" component={Ayarlar} options={{ drawerLabel: 'Ayarlar',
        drawerIcon: ({ focused }) => (
            <Image
              source={require('../assets/settings.png')}
              style={[
                styles.icon,
                { tintColor: focused ? '#fff' : '#ccc' }
              ]}
            />
          )
       }}/>
      <Drawer.Screen name="Hakkinda" component={Hakkinda} options={{ drawerLabel: 'Hakkında',
        drawerIcon: ({ focused }) => (
            <Image
              source={require('../assets/info.png')}
              style={[
                styles.icon,
                { tintColor: focused ? '#fff' : '#ccc' }
              ]}
            />
          )
       }}/>
    </Drawer.Navigator>
  )
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  title: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
})