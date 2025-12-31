// Comprehensive list of Indian states and their major districts/cities with coordinates
export const statesAndDistricts = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tezpur'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnia'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Raigarh', 'Durg'],
  'Delhi': ['Central Delhi', 'New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Kullu', 'Mandi', 'Solan'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'],
  'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Senapati'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Williamnagar'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib', 'Serchhip'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
  'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Vellore'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailasahar', 'Belonia'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Allahabad', 'Ghaziabad'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Rishikesh', 'Nainital', 'Mussoorie'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Darjeeling']
};

// Major city coordinates
export const locations = [
  // Andhra Pradesh
  { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185, state: "Andhra Pradesh", district: "Visakhapatnam" },
  { name: "Vijayawada", lat: 16.5062, lng: 80.6480, state: "Andhra Pradesh", district: "Vijayawada" },
  
  // Delhi
  { name: "Connaught Place", lat: 28.6289, lng: 77.2074, state: "Delhi", district: "New Delhi" },
  { name: "Chandni Chowk", lat: 28.6506, lng: 77.2311, state: "Delhi", district: "North Delhi" },
  
  // Gujarat
  { name: "Sabarmati Riverfront", lat: 23.0225, lng: 72.5714, state: "Gujarat", district: "Ahmedabad" },
  { name: "Science City", lat: 23.0763, lng: 72.5264, state: "Gujarat", district: "Ahmedabad" },
  
  // Karnataka
  { name: "MG Road", lat: 12.9719, lng: 77.6186, state: "Karnataka", district: "Bangalore" },
  { name: "Electronic City", lat: 12.8399, lng: 77.6770, state: "Karnataka", district: "Bangalore" },
  
  // Maharashtra
  { name: "Marine Drive", lat: 18.9442, lng: 72.8235, state: "Maharashtra", district: "Mumbai" },
  { name: "Juhu Beach", lat: 19.0948, lng: 72.8258, state: "Maharashtra", district: "Mumbai" },
  
  // Tamil Nadu
  { name: "Marina Beach", lat: 13.0500, lng: 80.2824, state: "Tamil Nadu", district: "Chennai" },
  { name: "T Nagar", lat: 13.0418, lng: 80.2341, state: "Tamil Nadu", district: "Chennai" },
  
  // Telangana
  { name: "Charminar", lat: 17.3616, lng: 78.4747, state: "Telangana", district: "Hyderabad" },
  { name: "Hitec City", lat: 17.4435, lng: 78.3772, state: "Telangana", district: "Hyderabad" },
  
  // Uttar Pradesh
  { name: "Taj Mahal", lat: 27.1751, lng: 78.0421, state: "Uttar Pradesh", district: "Agra" },
  { name: "Hazratganj", lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh", district: "Lucknow" },
  
  // West Bengal
  { name: "Park Street", lat: 22.5551, lng: 88.3517, state: "West Bengal", district: "Kolkata" },
  { name: "Salt Lake City", lat: 22.5806, lng: 88.4089, state: "West Bengal", district: "Kolkata" }
];