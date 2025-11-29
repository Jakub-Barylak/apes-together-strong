export type userType = {
  id: number;
  username: string;
  email: string;
  bananas: number;
  personality: number[];
  tags: number[];
};

export type eventType = {
  id: number;
  title: string;
  description: string;
  date: string;
  latitude: number;
  longitude: number;
  location_name: string;
  tags: number[];
  personality: number[];
};
