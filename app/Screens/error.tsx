import React from "react";
import { Text, View } from "react-native";

const error = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 50, color: "red" }}>ERROR</Text>
    </View>
  );
};

export default error;
