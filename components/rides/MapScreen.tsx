import React, { useEffect, useState } from "react";
import { View, Text, Modal, Image, Pressable } from "react-native";
import { WebView } from "react-native-webview";
import { useWebSocket } from "./useWebSocket";
import { initialPassengers } from "./passengerData";

export default function MapScreen() {
  const [passengers, setPassengers] = useState(initialPassengers);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  useWebSocket("ride123", (updated) => {
    setPassengers(prev =>
      prev.map(p => {
        const u = updated.find(up => up.id === p.id);
        return u ? { ...p, lat: u.lat, lng: u.lng } : p;
      })
    );
  });

  const handleEndRide = () => {
    setShowConfirmEnd(true);
  };

  const confirmEnd = (accept: boolean) => {
    setShowConfirmEnd(false);
    if (accept) {
      // send to backend -> add earnings
    } else {
      // send dispute flag
    }
  };

  const renderMapHTML = () => {
    const markers = passengers.map(
      (p) => `
        new maplibregl.Marker({ element: createMarker("${p.profilePic}") })
          .setLngLat([${p.lng}, ${p.lat}])
          .addTo(map)
          .getElement().addEventListener('click', () => {
            window.ReactNativeWebView.postMessage('${p.id}');
          });
      `
    ).join("\n");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js"></script>
        <link href="https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css" rel="stylesheet" />
        <style>html, body, #map { height: 100%; margin: 0; }</style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          function createMarker(url) {
            const el = document.createElement('div');
            el.style.width = '40px';
            el.style.height = '40px';
            el.style.borderRadius = '9999px';
            el.style.border = '3px solid white';
            el.style.backgroundImage = 'url(' + url + ')';
            el.style.backgroundSize = 'cover';
            el.style.boxShadow = '0 0 10px red';
            return el;
          }

          const map = new maplibregl.Map({
            container: 'map',
            style: 'https://demotiles.maplibre.org/style.json',
            center: [3.3792, 6.5244],
            zoom: 14
          });

          ${markers}
        </script>
      </body>
      </html>
    `;
  };

  return (
    <View className="flex-1">
      <WebView
        originWhitelist={["*"]}
        source={{ html: renderMapHTML() }}
        onMessage={(e) => {
          const pid = e.nativeEvent.data;
          const p = passengers.find(p => p.id === pid);
          if (p) setSelectedPassenger(p);
        }}
      />

      {/* Passenger Modal */}
      <Modal visible={!!selectedPassenger} transparent>
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white p-4 rounded-xl w-11/12">
            <View className="flex-row items-center mb-4">
              <Image source={{ uri: selectedPassenger?.profilePic }} className="w-16 h-16 rounded-full mr-4" />
              <Text className="text-lg font-bold">{selectedPassenger?.name}</Text>
            </View>
            <Pressable onPress={() => handleEndRide()} className="bg-green-600 p-3 rounded-xl mb-2">
              <Text className="text-white text-center">End Ride</Text>
            </Pressable>
            <Pressable className="bg-red-600 p-3 rounded-xl mb-2">
              <Text className="text-white text-center">Cancel Ride</Text>
            </Pressable>
            <Pressable className="bg-blue-600 p-3 rounded-xl" onPress={() => {}}>
              <Text className="text-white text-center">Chat</Text>
            </Pressable>
            <Pressable onPress={() => setSelectedPassenger(null)} className="mt-4">
              <Text className="text-center text-gray-500">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* End Ride Confirmation */}
      <Modal visible={showConfirmEnd} transparent>
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white p-6 rounded-xl w-10/12">
            <Text className="text-center text-lg font-semibold mb-4">
              End this trip and add fare to your wallet?
            </Text>
            <View className="flex-row justify-around">
              <Pressable onPress={() => confirmEnd(true)} className="bg-green-700 p-3 px-6 rounded-xl">
                <Text className="text-white">Yes</Text>
              </Pressable>
              <Pressable onPress={() => confirmEnd(false)} className="bg-red-700 p-3 px-6 rounded-xl">
                <Text className="text-white">No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
