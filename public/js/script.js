const userColors = {};

const colors = [
  "red",
  "green",
  "orange",
  "yellow",
  "violet",
  "grey",
  "blue",
  "black",
];

let userColor = localStorage.getItem("userColor");

if (!userColor) {
  const availableColors = colors.filter(
    (color) => !Object.values(localStorage).includes(color)
  );

  userColor =
    availableColors[Math.floor(Math.random() * availableColors.length)] ||
    "blue";
  localStorage.setItem("userColor", userColor);
}

function getColorIcon(color) {
  return new L.Icon({
    iconUrl: `/markers/${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

const socket = io();
//onsole.log("hey this");

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { longitude, latitude } = position.coords;
      socket.emit("send-location", { latitude, longitude, color: userColor });
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  );
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap-Shivateja",
}).addTo(map);

const markers = {};
socket.on("recieve-location", (data) => {
  const { id, latitude, longitude, color } = data;
  map.setView([latitude, longitude], 16);
  if (!userColors[id]) {
    userColors[id] = color;
  }

  const icon = getColorIcon(userColors[id]);
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude], { icon }).addTo(map);
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
