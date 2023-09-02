import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomNavigation } from 'react-native-paper';
import Home from './Home';
import Report from './Report';
import Settings from './Settings';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const HomeRoute = () => <Home />;
const ReportRoute = () => <Report />;
const SettingsRoute = () => <Settings />;

const getIcon = (route, focused, color) => {
  if (route.key === 'home') {
    return <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={24} />;
  } else if (route.key === 'report') {
    return <MaterialCommunityIcons name={focused ? 'file-document' : 'file-document-outline'} color={color} size={24} />;
  } else if (route.key === 'settings') {
    return <Ionicons name={focused ? 'settings' : 'settings-outline'} color={color} size={24} />;
  }
};

const App = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'home', title: 'Home' },
    { key: 'report', title: 'Report' },
    { key: 'settings', title: 'Settings' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: HomeRoute,
    report: ReportRoute,
    settings: SettingsRoute,
  });

  return (
    <SafeAreaProvider>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        renderIcon={(props) => getIcon(props.route, props.focused, props.color)}
      />
    </SafeAreaProvider>
  );
};

export default App;
