import React from 'react';
import { View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Tabs, TabScreen } from 'react-native-paper-tabs';

import First from './ReportTabs/First';
import Second from './ReportTabs/Second';
import Third from './ReportTabs/Third';

const Report = () => {
  return (
    <PaperProvider>
      <View style={{ flex: 1, marginTop: 50 }}>
        <Tabs>
          <TabScreen label="A">
            <First />
          </TabScreen>
          <TabScreen label="B">
            <Second />
          </TabScreen>
          <TabScreen label="C">
            <Third />
          </TabScreen>
        </Tabs>
      </View>
    </PaperProvider>
  );
};

export default Report;
