import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MemoSegmentsProvider } from '../../context/MemoSegmentsContext';

import Accueil from './home';
import Parametres from './reglages';
import GrandsFeux from './liquides-inflammables';
import DebitMaxPEI from './capacite-pei';
import Relais from './pompage-relais';
import CalculEtablissement from './calcul-etablissement';
import CalculPertesDeCharge from './calcul-pertes-de-charge';

const Tabs = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <MemoSegmentsProvider>
      <Tabs.Navigator
        initialRouteName="home"
        screenOptions={{
          tabBarActiveTintColor: '#1976D2',
          tabBarInactiveTintColor: '#6B7280',
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 9,
            fontWeight: '600',
            marginBottom: 2,
            width: '100%',
            textAlign: 'center',
          },
          tabBarItemStyle: {
            minWidth: 0,
          },
          tabBarStyle: {
            height: 64,
            paddingTop: 4,
            paddingBottom: 6,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          component={Accueil}
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size ?? 26} color={color} />
            ),
          }}
          initialParams={{ initial: true }}
        />
        <Tabs.Screen
          name="calcul-pertes-de-charge"
          component={CalculPertesDeCharge}
          options={{
            title: 'Pertes',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="water-pump" size={size ?? 26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calcul-etablissement"
          component={CalculEtablissement}
          options={{
            title: 'Étab.',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="construct" size={size ?? 26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="capacite-pei"
          component={DebitMaxPEI}
          options={{
            title: 'PEI',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="speedometer" size={size ?? 26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="pompage-relais"
          component={Relais}
          options={{
            title: 'Relais',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="swap-horizontal" size={size ?? 26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="liquides-inflammables"
          component={GrandsFeux}
          options={{
            title: 'Mousse',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="fire" size={size ?? 26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="reglages"
          component={Parametres}
          options={{
            title: 'Paramètres',
            tabBarButton: () => null,
            tabBarItemStyle: { display: 'none' },
          }}
        />
      </Tabs.Navigator>
    </MemoSegmentsProvider>
  );
}
