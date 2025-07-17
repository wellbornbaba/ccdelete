export const carModels: string[] = [
  // Toyota
  "Toyota Corolla",
  "Toyota Camry",
  "Toyota RAV4",
  "Toyota Highlander",
  "Toyota Land Cruiser",
  "Toyota Yaris",
  "Toyota Venza",
  "Toyota Hilux",
  "Toyota Avalon",
  "Toyota Sienna",

  // Honda
  "Honda Accord",
  "Honda Civic",
  "Honda CR-V",
  "Honda Pilot",
  "Honda HR-V",

  // Hyundai
  "Hyundai Elantra",
  "Hyundai Sonata",
  "Hyundai Tucson",
  "Hyundai Santa Fe",
  "Hyundai Palisade",
  "Hyundai Accent",

  // Kia
  "Kia Rio",
  "Kia Cerato",
  "Kia Sportage",
  "Kia Sorento",
  "Kia Picanto",
  "Kia Seltos",

  // Nissan
  "Nissan Altima",
  "Nissan Maxima",
  "Nissan Rogue",
  "Nissan Pathfinder",
  "Nissan Sentra",
  "Nissan Frontier",

  // Ford
  "Ford Focus",
  "Ford Fusion",
  "Ford Explorer",
  "Ford Escape",
  "Ford Edge",
  "Ford F-150",

  // Volkswagen
  "Volkswagen Golf",
  "Volkswagen Jetta",
  "Volkswagen Passat",
  "Volkswagen Tiguan",
  "Volkswagen Touareg",

  // Mercedes-Benz
  "Mercedes-Benz C-Class",
  "Mercedes-Benz E-Class",
  "Mercedes-Benz GLA",
  "Mercedes-Benz GLC",
  "Mercedes-Benz GLK",
  "Mercedes-Benz GLE",

  // BMW
  "BMW 3 Series",
  "BMW 5 Series",
  "BMW X1",
  "BMW X3",
  "BMW X5",

  // Lexus
  "Lexus ES",
  "Lexus RX",
  "Lexus GX",
  "Lexus NX",
  "Lexus LX",

  // Others
  "Peugeot 508",
  "Peugeot 3008",
  "Mazda 3",
  "Mazda CX-5",
  "Chevrolet Malibu",
  "Chevrolet Equinox",
  "Tesla Model 3",
  "Tesla Model Y",
  "Innoson Umu Sedan",
  "Innoson G5",
  "Innoson G6",
];

export const carModelGrouped: Record<string, string[]> = {
  Toyota: ["Corolla", "Camry", "RAV4", "Highlander", "Land Cruiser", "Yaris", "Hilux", "Venza"],
  Honda: ["Accord", "Civic", "CR-V", "Pilot"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Accent", "Palisade"],
  Kia: ["Rio", "Cerato", "Sportage", "Sorento", "Seltos"],
  Nissan: ["Altima", "Maxima", "Rogue", "Pathfinder", "Frontier"],
  Ford: ["Focus", "Fusion", "Explorer", "Escape", "Edge", "F-150"],
  Lexus: ["ES", "RX", "GX", "NX", "LX"],
  BMW: ["3 Series", "5 Series", "X1", "X3", "X5"],
  Mercedes: ["C-Class", "E-Class", "GLA", "GLC", "GLK", "GLE"],
};



export const carColors = [
  'Black',
  'White',
  'Silver',
  'Gray',
  'Blue',
  'Red',
  'Green',
  'Brown',
  'Gold',
  'Yellow',
];

export const seatOptions = [2, 4, 5, 6, 7, 8];

export const carYears = Array.from({ length: 25 }, (_, i) => `${new Date().getFullYear() - i}`);
