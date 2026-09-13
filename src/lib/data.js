/* ============================================================================
   2 · CURRENCY  ·  KWD is the base; the dinar is quoted to three decimals
   ========================================================================== */

const CURRENCIES = [
  { code: 'KWD', rate: 1, dp: 3, sym: ['KD', 'د.ك', 'KD'], name: ['Kuwaiti Dinar', 'دينار كويتي', 'Dinar koweïtien'] },
  { code: 'SAR', rate: 12.24, dp: 2, sym: ['SR', 'ر.س', 'SR'], name: ['Saudi Riyal', 'ريال سعودي', 'Riyal saoudien'] },
  { code: 'AED', rate: 11.99, dp: 2, sym: ['AED', 'د.إ', 'AED'], name: ['UAE Dirham', 'درهم إماراتي', 'Dirham émirati'] },
  { code: 'USD', rate: 3.265, dp: 2, sym: ['$', '$', '$'], name: ['US Dollar', 'دولار أمريكي', 'Dollar américain'] }
];

const SHIP_FLAT_KWD = 2.5;
const FREE_SHIP_OVER_KWD = 150;
const PROMOS = { CARBON10: 0.1, SOUQ15: 0.15, KWTFREE: 0 };

/* ============================================================================
   3 · VEHICLES, KUWAIT GEOGRAPHY, CATALOG SEED
   ========================================================================== */

const BRANDS = [
  { id: 'toyota', label: 'Toyota', ar: 'تويوتا', hue: 8 },
  { id: 'nissan', label: 'Nissan', ar: 'نيسان', hue: 355 },
  { id: 'lexus', label: 'Lexus', ar: 'لكزس', hue: 210 },
  { id: 'ford', label: 'Ford', ar: 'فورد', hue: 218 },
  { id: 'bmw', label: 'BMW', ar: 'بي إم دبليو', hue: 205 },
  { id: 'mercedes', label: 'Mercedes-Benz', ar: 'مرسيدس', hue: 190 },
  { id: 'porsche', label: 'Porsche', ar: 'بورش', hue: 40 },
  { id: 'honda', label: 'Honda', ar: 'هوندا', hue: 0 },
  { id: 'audi', label: 'Audi', ar: 'أودي', hue: 350 },
  { id: 'chevrolet', label: 'Chevrolet', ar: 'شفروليه', hue: 45 },
  { id: 'hyundai', label: 'Hyundai', ar: 'هيونداي', hue: 200 },
  { id: 'kia', label: 'Kia', ar: 'كيا', hue: 348 }
];

/* Six governorates of Kuwait; area lists are the real residential blocks. */
const GOVERNORATES = [
  { id: 'asimah', en: 'Al Asimah (Capital)', ar: 'العاصمة', fr: 'Al Asimah (Capitale)', xy: [50, 30],
    areas: ['Kuwait City|مدينة الكويت', 'Sharq|شرق', 'Dasman|دسمان', 'Qibla|قبلة', 'Mirqab|المرقاب', 'Shamiya|الشامية', 'Qadsiya|القادسية', 'Faiha|الفيحاء', 'Adailiya|العديلية', 'Khaldiya|الخالدية', 'Rawda|الروضة', 'Shuwaikh|الشويخ', 'Sulaibikhat|الصليبخات', 'Doha|الدوحة', 'Jaber Al-Ahmad|جابر الأحمد'] },
  { id: 'hawalli', en: 'Hawalli', ar: 'حولي', fr: 'Hawalli', xy: [56, 42],
    areas: ['Hawalli|حولي', 'Salmiya|السالمية', 'Rumaithiya|الرميثية', 'Bayan|بيان', 'Mishref|مشرف', 'Salwa|سلوى', 'Jabriya|الجابرية', 'Shaab|الشعب', 'Zahra|الزهراء', 'Siddiq|الصديق', 'Hitteen|حطين', 'Maidan Hawalli|ميدان حولي'] },
  { id: 'farwaniya', en: 'Al Farwaniya', ar: 'الفروانية', fr: 'Al Farwaniya', xy: [44, 46],
    areas: ['Farwaniya|الفروانية', 'Khaitan|خيطان', 'Jleeb Al-Shuyoukh|جليب الشيوخ', 'Rabiya|الرابية', 'Andalous|الأندلس', 'Ardiya|العارضية', 'Riggae|الرقعي', 'Firdous|الفردوس', 'Omariya|العمرية', 'Abdullah Al-Mubarak|عبدالله المبارك'] },
  { id: 'mubarak', en: 'Mubarak Al-Kabeer', ar: 'مبارك الكبير', fr: 'Moubarak Al-Kabir', xy: [54, 55],
    areas: ['Mubarak Al-Kabeer|مبارك الكبير', 'Sabah Al-Salem|صباح السالم', 'Messila|المسيلة', 'Abu Fatira|أبو فطيرة', 'Abu Al-Hasaniya|أبو الحصانية', 'Adan|العدان', 'Qurain|القرين', 'Qusour|القصور', 'Funaitees|الفنيطيس'] },
  { id: 'ahmadi', en: 'Al Ahmadi', ar: 'الأحمدي', fr: 'Al Ahmadi', xy: [48, 72],
    areas: ['Ahmadi|الأحمدي', 'Fahaheel|الفحيحيل', 'Mangaf|المنقف', 'Abu Halifa|أبو حليفة', 'Fintas|الفنطاس', 'Mahboula|المهبولة', 'Egaila|العقيلة', 'Sabahiya|الصباحية', 'Riqqa|الرقة', 'Wafra|الوفرة'] },
  { id: 'jahra', en: 'Al Jahra', ar: 'الجهراء', fr: 'Al Jahra', xy: [26, 30],
    areas: ['Jahra|الجهراء', 'Saad Al-Abdullah|سعد العبدالله', 'Naeem|النعيم', 'Oyoun|العيون', 'Qasr|القصر', 'Waha|الواحة', 'Sulaibiya|الصليبية', 'Taima|تيماء'] }
];

/* Each art id maps to a hand-drawn SVG render and to a 3D assembly on the car. */
const SEED_PARTS = [
  { id: 'p1', name: ['Brembo GT 6-piston front kit', 'طقم فرامل بريمبو GT أمامي ٦ مكابس', 'Kit avant Brembo GT 6 pistons'],
    oem: '34-11-2-284-810', brand: 'bmw', price: 489.5, prio: 'high', art: 'brake', anchor: 'brakeFL',
    spec: ['380 × 34 mm floating rotors · monobloc caliper', 'أقراص عائمة ٣٨٠ × ٣٤ مم · كاليبر مونوبلوك', 'Disques flottants 380 × 34 mm · étrier monobloc'] },
  { id: 'p2', name: ['Garrett GTX2867R turbocharger', 'تيربو غاريت GTX2867R', 'Turbocompresseur Garrett GTX2867R'],
    oem: '14411-JF00A', brand: 'nissan', price: 612, prio: 'high', art: 'turbo', anchor: 'turbo',
    spec: ['Dual ball bearing · 0.86 A/R hot side', 'محامل كروية مزدوجة · نسبة ٠٫٨٦', 'Double roulement · carter 0,86 A/R'] },
  { id: 'p3', name: ['Cold air intake system', 'نظام سحب هواء بارد', 'Admission d’air direct'],
    oem: '17801-0C010', brand: 'toyota', price: 74.25, prio: 'medium', art: 'filter', anchor: 'airbox',
    spec: ['Washable cotton element · heat shield', 'فلتر قطني قابل للغسل · حاجز حراري', 'Élément coton lavable · bouclier thermique'] },
  { id: 'p4', name: ['Bilstein B16 coilover set', 'طقم مساعدات بيلشتاين B16', 'Kit combinés filetés Bilstein B16'],
    oem: '997-343-041-06', brand: 'porsche', price: 852, prio: 'medium', art: 'coilover', anchor: 'suspFL',
    spec: ['10-way damping · 40 mm drop range', 'ضبط ١٠ درجات · انخفاض حتى ٤٠ مم', 'Amortissement 10 crans · abaissement 40 mm'] },
  { id: 'p5', name: ['LED matrix headlight · right', 'مصباح أمامي LED مصفوفي · يمين', 'Phare LED matriciel · droit'],
    oem: '81145-53270', brand: 'lexus', price: 318.75, prio: 'low', art: 'headlight', anchor: 'headlightR',
    spec: ['Adaptive high beam · 84-segment array', 'إضاءة عالية تكيفية · ٨٤ شريحة', 'Feux adaptatifs · 84 segments'] },
  { id: 'p6', name: ['Titanium cat-back exhaust', 'شكمان تيتانيوم كامل', 'Ligne d’échappement titane'],
    oem: 'A190-490-06-00', brand: 'mercedes', price: 1145, prio: 'high', art: 'exhaust', anchor: 'exhaust',
    spec: ['76 mm · valved rear silencer · −11 kg', '٧٦ مم · صمامات · أخف ١١ كجم', '76 mm · silencieux à clapets · −11 kg'] },
  { id: 'p7', name: ['Aluminium radiator · dual pass', 'ردياتير ألمنيوم بمسارين', 'Radiateur aluminium double passe'],
    oem: 'FR3Z-8005-B', brand: 'ford', price: 128.4, prio: 'medium', art: 'radiator', anchor: 'radiator',
    spec: ['52 mm core · TIG-welded end tanks', 'قلب ٥٢ مم · خزانات ملحومة', 'Faisceau 52 mm · boîtes soudées TIG'] },
  { id: 'p8', name: ['Iridium spark plug set of 6', 'طقم بواجي إيريديوم ٦ حبات', 'Jeu de 6 bougies iridium'],
    oem: '12290-5A2-A01', brand: 'honda', price: 31.2, prio: 'low', art: 'plug', anchor: 'plugs',
    spec: ['0.6 mm fine wire · gapped to 0.8 mm', 'سلك ٠٫٦ مم · فتحة ٠٫٨ مم', 'Fil fin 0,6 mm · écartement 0,8 mm'] },
  { id: 'p9', name: ['AGM battery 95 Ah', 'بطارية AGM ٩٥ أمبير', 'Batterie AGM 95 Ah'],
    oem: '4H0-915-105', brand: 'audi', price: 66.75, prio: 'medium', art: 'battery', anchor: 'battery',
    spec: ['850 A cold crank · start-stop rated', 'تدوير بارد ٨٥٠ أمبير · تدعم التشغيل والإيقاف', '850 A à froid · compatible start-stop'] },
  { id: 'p10', name: ['Carbon rear wing', 'جنح خلفي كربون', 'Aileron arrière carbone'],
    oem: '991-512-125-9G2', brand: 'porsche', price: 735, prio: 'low', art: 'wing', anchor: 'wing',
    spec: ['Pre-preg twill · 41 kg downforce at 200 km/h', 'كربون منسوج · ٤١ كجم ضغط عند ٢٠٠ كم/س', 'Pré-imprégné · 41 kg d’appui à 200 km/h'] },
  { id: 'p11', name: ['20-inch forged wheel set', 'طقم جنوط مطروقة ٢٠ إنش', 'Jeu de jantes forgées 20"'],
    oem: '40300-6HH1A', brand: 'nissan', price: 980, prio: 'high', art: 'wheel', anchor: 'wheelFL',
    spec: ['20 × 9.5J ET38 · 8.9 kg per wheel', '٢٠ × ٩٫٥ ET38 · ٨٫٩ كجم للجنط', '20 × 9,5J ET38 · 8,9 kg par jante'] },
  { id: 'p12', name: ['Twin-disc clutch & gearbox mount', 'دبرياج مزدوج وحاضنة جيربوكس', 'Embrayage bidisque et support'],
    oem: '31250-24010', brand: 'toyota', price: 296.5, prio: 'medium', art: 'gearbox', anchor: 'gearbox',
    spec: ['800 Nm rated · sprung centre hub', 'يتحمل ٨٠٠ نيوتن متر · مركز مرن', '800 Nm · moyeu amorti'] }
];

const ART_PRESETS = ['brake', 'turbo', 'filter', 'coilover', 'headlight', 'exhaust', 'radiator', 'plug', 'battery', 'wing', 'wheel', 'gearbox'];

const ART_LABEL = {
  brake: ['Brake kit', 'طقم فرامل', 'Kit de freins'],
  turbo: ['Turbocharger', 'تيربو', 'Turbo'],
  filter: ['Intake / filter', 'سحب / فلتر', 'Admission / filtre'],
  coilover: ['Suspension', 'تعليق', 'Suspension'],
  headlight: ['Lighting', 'إضاءة', 'Éclairage'],
  exhaust: ['Exhaust', 'شكمان', 'Échappement'],
  radiator: ['Cooling', 'تبريد', 'Refroidissement'],
  plug: ['Ignition', 'إشعال', 'Allumage'],
  battery: ['Electrical', 'كهرباء', 'Électricité'],
  wing: ['Aero', 'ديناميكا', 'Aéro'],
  wheel: ['Wheels', 'جنوط', 'Jantes'],
  gearbox: ['Drivetrain', 'ناقل الحركة', 'Transmission']
};

/* Anchor id -> label shown in the 3D HUD, plus the assembly it highlights. */
const ANCHOR_LABEL = {
  brakeFL: ['Front left brake assembly', 'مجموعة الفرامل الأمامية اليسرى', 'Ensemble de frein avant gauche'],
  wheelFL: ['Front left wheel', 'العجلة الأمامية اليسرى', 'Roue avant gauche'],
  turbo: ['Turbo & manifold', 'التيربو والمشعب', 'Turbo et collecteur'],
  airbox: ['Airbox & intake', 'صندوق الهواء والسحب', 'Boîte à air et admission'],
  suspFL: ['Front left coilover', 'مساعد أمامي أيسر', 'Combiné avant gauche'],
  headlightR: ['Right headlamp', 'المصباح الأمامي الأيمن', 'Phare avant droit'],
  exhaust: ['Exhaust system', 'نظام العادم', 'Ligne d’échappement'],
  radiator: ['Radiator pack', 'مجموعة الردياتير', 'Bloc radiateur'],
  plugs: ['Cylinder head & plugs', 'رأس المحرك والبواجي', 'Culasse et bougies'],
  battery: ['Battery tray', 'حاضنة البطارية', 'Bac de batterie'],
  wing: ['Rear wing', 'الجنح الخلفي', 'Aileron arrière'],
  gearbox: ['Gearbox & driveshaft', 'الجيربوكس وعمود الدفع', 'Boîte et transmission']
};


export { ANCHOR_LABEL, ART_LABEL, ART_PRESETS, BRANDS, CURRENCIES, FREE_SHIP_OVER_KWD, GOVERNORATES, PROMOS, SEED_PARTS, SHIP_FLAT_KWD };
