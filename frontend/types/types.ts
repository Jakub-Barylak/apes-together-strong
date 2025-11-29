export type InfoPanelHandle = {
  open: () => void;
  close: () => void;
};

export type InfoPanelProps = {
  headerComponent?: React.ReactNode;
  children: React.ReactNode;
  visible?: boolean;
  onClose?: () => void;
};

export type ReactLeafletModule = typeof import("react-leaflet");

export type LeafletModule = typeof import("leaflet");

export type MapLibs = {
  L: LeafletModule;
  MapContainer: ReactLeafletModule["MapContainer"];
  TileLayer: ReactLeafletModule["TileLayer"];
  Marker: ReactLeafletModule["Marker"];
  Popup: ReactLeafletModule["Popup"];
  useMap: ReactLeafletModule["useMap"];
  Circle: ReactLeafletModule["Circle"];
  CircleMarker: ReactLeafletModule["CircleMarker"];
};

export type LatLng = [number, number];

export type AtsEvent = {
  id: number;
  position: LatLng;
};

export type MapBounds = {
  n: number;
  s: number;
  e: number;
  w: number;
};
