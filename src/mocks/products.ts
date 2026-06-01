export interface Product {
  id: string;
  title: string;
  price: number;
  category: 'romantico' | 'atrevido' | 'novia' | 'comfy' | 'minimalista' | 'premium';
  sizes: string[]; // Talles de corpiño disponibles en stock
  imageUrl: string;
  description: string;
  matchTitle: string; // Prenda inferior recomendada para Get the Look
  matchPrice: number; // Precio de la prenda inferior recomendada
  // Nuevos atributos Multimarca y Funcionales (Fase 6)
  brand: 'Valisere' | 'Darling' | 'Hope' | 'Liz' | 'Sedução';
  color: 'Rojo' | 'Negro' | 'Blanco' | 'Almendra' | 'Nude' | 'Oro';
  supportLevel: 'bajo' | 'medio' | 'alto'; // "bajo" -> Soporte sutil, "medio" -> Excelente soporte diario, "alto" -> Ideal para uso prolongado
  transparency: 'ninguna' | 'baja' | 'alta'; // "ninguna" -> Opaco refinado, "baja" -> Sensual delicado, "alta" -> Encaje translúcido
  immediateAvailability: boolean;
  mood: 'dia-a-dia' | 'comodo-y-suave' | 'noche-especial' | 'invisible' | 'elegancia-minimalista' | 'sensual-delicado' | 'bridal' | 'lounge';
  // Atributos de Colección y Badges Comerciales (Fase 7 - CMS Ready)
  collections?: string[];
  badges?: string[];
  // Propiedad de Drops Curatoriales (Fase 8)
  drop: 'encaje-noir' | 'soft-cotton' | 'invisible-nude' | 'lounge-serena' | 'bridal-capsule';
  // Inventario granular por variante de talle (Fase 9)
  stockVariants?: Record<string, number>;
}

export const PRODUCTS: Product[] = [
  {
    id: "card-1",
    title: "Bustier Rouge Romantique",
    price: 24500,
    category: "romantico",
    sizes: ["85", "90", "95"],
    imageUrl: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop",
    description: "Bustier de encaje floral brasilero de alta costura rojo carmín. Diseñado con copas estructuradas y tirantes finos ajustables para moldear con total comodidad.",
    matchTitle: "Cola-less Rouge Silk",
    matchPrice: 10500,
    brand: "Valisere",
    color: "Rojo",
    supportLevel: "alto",
    transparency: "alta",
    immediateAvailability: true,
    mood: "noche-especial",
    collections: ["noche-especial", "encaje-brasilero"],
    badges: ["Nuevo ingreso Brasil"],
    drop: "encaje-noir",
    stockVariants: { "85": 4, "90": 3, "95": 2 }
  },
  {
    id: "card-2",
    title: "Bralette Onyx Noir",
    price: 21000,
    category: "atrevido",
    sizes: ["90", "95", "100"],
    imageUrl: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=600&auto=format&fit=crop",
    description: "Bralette negro de tul ultra suave con transparencias y arneses decorativos. Un diseño sensual brasilero que celebra tu cuerpo con elegancia natural.",
    matchTitle: "Less Onyx Encaje",
    matchPrice: 9800,
    brand: "Darling",
    color: "Negro",
    supportLevel: "bajo",
    transparency: "alta",
    immediateAvailability: true,
    mood: "sensual-delicado",
    collections: ["noche-especial", "encaje-brasilero", "elegancia-negra"],
    badges: ["Últimos talles"],
    drop: "encaje-noir",
    stockVariants: { "90": 2, "95": 5, "100": 1 }
  },
  {
    id: "card-3",
    title: "Corset Blanc de L'amour",
    price: 28000,
    category: "novia",
    sizes: ["85", "90", "100"],
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop",
    description: "Corset de novia confeccionado en satén de seda blanco importado de Brasil con apliques de guipur. Ajuste trasero regulable muy elegante.",
    matchTitle: "Cola-less Satinada Blanc",
    matchPrice: 12000,
    brand: "Liz",
    color: "Blanco",
    supportLevel: "alto",
    transparency: "baja",
    immediateAvailability: false,
    mood: "bridal",
    collections: ["bridal", "minimal-satin"],
    badges: ["Reposición reciente"],
    drop: "bridal-capsule",
    stockVariants: { "85": 0, "90": 3, "100": 1 }
  },
  {
    id: "card-4",
    title: "Camisolín Soft Almond",
    price: 19500,
    category: "comfy",
    sizes: ["95", "100", "105"],
    imageUrl: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=600&auto=format&fit=crop",
    description: "Camisolín de seda fría color almendra con delicados detalles de encaje en el escote. Caída impecable y frescura ideal para momentos de descanso.",
    matchTitle: "Bikini Almond Seda",
    matchPrice: 8500,
    brand: "Hope",
    color: "Almendra",
    supportLevel: "bajo",
    transparency: "baja",
    immediateAvailability: true,
    mood: "lounge",
    collections: ["confort-premium"],
    badges: ["Disponible hoy"],
    drop: "lounge-serena",
    stockVariants: { "95": 5, "100": 4, "105": 3 }
  },
  {
    id: "card-5",
    title: "Bralette Cotton Nude",
    price: 17000,
    category: "minimalista",
    sizes: ["85", "90", "95", "100"],
    imageUrl: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=600&auto=format&fit=crop",
    description: "Bralette minimalista confeccionado en algodón pima brasilero color nude. Costuras planas invisibles e ideal para la comodidad del día a día.",
    matchTitle: "Cola-less Algodón Pure",
    matchPrice: 7900,
    brand: "Liz",
    color: "Nude",
    supportLevel: "medio",
    transparency: "ninguna",
    immediateAvailability: true,
    mood: "dia-a-dia",
    collections: ["suave-todos-los-dias", "invisible-bajo-tu-outfit"],
    badges: ["Invisible bajo ropa"],
    drop: "invisible-nude",
    stockVariants: { "85": 8, "90": 7, "95": 6, "100": 4 }
  },
  {
    id: "card-6",
    title: "Corset Luxury Gold",
    price: 32000,
    category: "premium",
    sizes: ["90", "95", "100", "105"],
    imageUrl: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop",
    description: "Edición limitada de importación directa. Corset con hilos de lúrex dorado entretejidos sobre encaje negro premium. Copas prehormadas con realce sutil.",
    matchTitle: "Cola-less Satin Luxury",
    matchPrice: 14500,
    brand: "Sedução",
    color: "Oro",
    supportLevel: "alto",
    transparency: "alta",
    immediateAvailability: true,
    mood: "elegancia-minimalista",
    collections: ["noche-especial", "encaje-brasilero", "elegancia-negra"],
    badges: ["Soporte premium"],
    drop: "encaje-noir",
    stockVariants: { "90": 2, "95": 1, "100": 0, "105": 2 }
  }
];
