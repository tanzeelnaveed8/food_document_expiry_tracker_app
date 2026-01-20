import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Main Screens
import ItemsListScreen from '../screens/items/ItemsListScreen';
import AddItemScreen from '../screens/items/AddItemScreen';
import ItemDetailScreen from '../screens/items/ItemDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Items: undefined;
  Profile: undefined;
};

export type ItemsStackParamList = {
  ItemsList: undefined;
  AddItem: undefined;
  ItemDetail: { itemId: string; itemType: 'FOOD' | 'DOCUMENT' };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const ItemsStack = createNativeStackNavigator<ItemsStackParamList>();

const ItemsNavigator = () => {
  return (
    <ItemsStack.Navigator>
      <ItemsStack.Screen
        name="ItemsList"
        component={ItemsListScreen}
        options={{ title: 'My Items' }}
      />
      <ItemsStack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{ title: 'Add Item' }}
      />
      <ItemsStack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={{ title: 'Item Details' }}
      />
    </ItemsStack.Navigator>
  );
};

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <MainTab.Navigator>
      <MainTab.Screen
        name="Items"
        component={ItemsNavigator}
        options={{ headerShown: false }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </MainTab.Navigator>
  );
};

export const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // TODO: Add loading screen
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
