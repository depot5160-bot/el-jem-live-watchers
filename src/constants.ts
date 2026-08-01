import { Language, OutageReport } from './types';

export const EL_JEM_CENTER: [number, number] = [35.29639, 10.70694]; // El Jem Amphitheatre
export const EXPIRY_HOURS = 24;
export const ADMIN_PASSWORD_HASH = "9bf4919c4474bda46e1fed6bb61c7b068da2c59d14e8b9fc8be6b4457337d24c";
export const ARCHIVE_WEBHOOK_URL = "https://eljem-signalements-api.eljem.workers.dev";

// Cartographie et chemins des logos d'opérateurs
export const OPERATOR_LOGOS: Record<string, string> = {
  steg: "/steg.png",
  sonede: "/sonede.png",
  ooredoo: "/oreedoo.png",
  tt: "/tunisie_telecom.png",
  orange: "/orange.png",
  topnet: "/topnet.png",
  gnet: "/gnet.png",
  hexabyte: "/hexabyte.png"
};

export const LOGOS_IMAGES = OPERATOR_LOGOS;

export interface SectorOption {
  id: string;
  fr: string;
  ar: string;
  center: [number, number];
  zoom: number;
}

export const EL_JEM_SECTORS: SectorOption[] = [
  { id: 'all', fr: 'Tous Quartiers', ar: 'جميع الأحياء', center: [35.29639, 10.70694], zoom: 15 },
  { id: 'centre', fr: 'Centre-Ville / Gare', ar: 'وسط المدينة / المحطة', center: [35.2982, 10.7095], zoom: 16.8 },
  { id: 'colisee', fr: 'Zone Colisée / Amphithéâtre', ar: 'منطقة القصر الروماني', center: [35.2965, 10.7069], zoom: 17.2 },
  { id: 'bourguiba', fr: 'Cité Bourguiba / Romaine', ar: 'حي بورقيبة / الحي الروماني', center: [35.2930, 10.7020], zoom: 16.8 },
  { id: 'bassatine', fr: 'El Bassatine', ar: 'حي البساتين', center: [35.3010, 10.7010], zoom: 16.8 },
  { id: 'mahdia', fr: 'Route de Mahdia', ar: 'طريق المهديّة', center: [35.2940, 10.7160], zoom: 16.5 },
  { id: 'sfax', fr: 'Route de Sfax', ar: 'طريق صفاقس', center: [35.2870, 10.7080], zoom: 16.5 },
  { id: 'sousse', fr: 'Route de Sousse', ar: 'طريق سوسة', center: [35.3060, 10.7090], zoom: 16.5 },
  { id: 'zgarna', fr: 'Zgarna / Henchir Chatar', ar: 'الزغارنة / خنشير شطار', center: [35.2830, 10.6980], zoom: 16.2 },
  { id: 'ennasr', fr: 'Cité Ennasr / Essour', ar: 'حي النصر / الحي الرياضي', center: [35.3000, 10.7140], zoom: 16.8 }
];

export const TYPE_COLORS = {
  eau: "#00E5FF", // Electric Cyan
  elec: "#FFB300", // Neon Amber
  net: "#E040FB"  // Neon Magenta
};

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  fr: {
    title: "El Jem Live",
    subtitle: "COMMAND CENTER",
    water: "Eau",
    elec: "Électricité",
    net: "Internet",
    reportBtn: "Signaler",
    recentFeedBtn: "5 Derniers",
    adminBtnLabel: "Admin",
    auditBtnLabel: "Diagnostic",
    stepLangTitle: "Bienvenue sur El Jem Live",
    stepLangSub: "Choisissez votre langue d'interface :",
    stepLocTitle: "Localisation de la coupure",
    stepLocSub: "Veuillez vérifier et confirmer votre position exacte.",
    locDetecting: "📍 Recherche GPS / IP en cours...",
    locIPSuccess: "📍 Position IP détectée. Veuillez réajuster au besoin.",
    locGPSSuccess: "📍 Position GPS haute précision capturée !",
    locFailed: "⚠️ Échec GPS/IP. Placez le repère manuellement sur la carte.",
    locChosen: "📍 Position confirmée avec succès !",
    locManualBtn: "Indiquer manuellement sur la carte",
    stepTypeTitle: "Sélection de la panne",
    stepTypeSub: "Quel réseau subit un dysfonctionnement ?",
    ispLabel: "Fournisseur d'accès Internet (FAI) :",
    stepDetailsTitle: "Précisions & Détails",
    stepDetailsSub: "Indiquez tout détail utile (rue, quartier, durée) :",
    notePlaceholder: "Ex: Coupure d'eau au quartier de la Gare depuis 2h...",
    backBtn: "Retour",
    nextBtn: "Continuer",
    submitBtn: "Envoyer le signalement",
    submitSending: "Transmissions...",
    toastSuccess: "Signalement transmis ! En cours de vérification.",
    adminTitle: "Console d'Administration",
    adminPassPlaceholder: "Mot de passe d'accès",
    adminLoginBtn: "Se Connecter",
    adminIncorrectPass: "Accès refusé - Mot de passe erroné",
    adminEmpty: "Aucun signalement correspondant aux filtres",
    approveBtn: "Publier",
    rejectBtn: "Rejeter",
    deleteBtn: "Supprimer",
    deleteConfirm: "Supprimer définitivement ce signalement de la carte et du registre ?",
    toastDeleted: "Signalement supprimé",
    changeTypeLabel: "Catégorie",
    toastTypeChanged: "Catégorie mise à jour",
    adminDateReset: "Réinitialiser",
    messengerContactLabel: "Contact Direct",
    adminPendingTitle: "Signalements En Attente",
    adminPublishedTitle: "Signalements Actifs sur Carte",
    adminRejectedTitle: "Signalements Rejetés",
    adminPublishedEmpty: "Aucune alerte publiée",
    toastPublished: "Signalement validé et publié !",
    toastRejected: "Signalement rejeté",
    popupWater: "Panne d'Eau",
    popupElec: "Panne d'Électricité",
    popupNet: "Panne d'Internet",
    popupPending: "⏳ En cours de validation",
    signalTime: "Signalé le {time}",
    confirmPickBtn: "Valider cette position",
    pickPromptText: "📍 Déplacez la carte sous le pointeur central",
    pickWaitingText: "Glissez la carte pour pointer la rue...",
    pickSearching: "Identification de la zone...",
    bannerStatsLabel: "📊 Alertes Actives",
    visitorCountLabel: "observateurs en ligne",
    recentTitle: "🚨 5 Derniers Signalements en Direct",
    recentSub: "Suivi en temps réel avec balises lumineuses clignotantes",
    noRecent: "Aucun signalement récent enregistré",
    clickToCenter: "Cliquer pour localiser sur la carte",
    adminSearchPlaceholder: "Rechercher par rue, quartier, note, ID...",
    allTypes: "Toutes catégories",
    allISPs: "Tous les FAI",
    allStatuses: "Tous les statuts",
    tabDashboard: "Tableau de Bord",
    tabPending: "En Attente",
    tabApproved: "Publiés sur Carte",
    tabRejected: "Rejetés / Archivés",
    statTotal: "Total Reçus",
    statPending: "En Attente",
    statPublished: "Validés",
    statRejected: "Rejetés",
    markRestoredBtn: "✅ Signaler le rétablissement",
    restoredBadge: "✅ Service Rétabli",
    restoredToast: "Merci ! Le rétablissement du service a été enregistré.",
    restoredDeniedToast: "⚠️ Seul l'auteur de ce signalement (même IP / appareil) peut valider le rétablissement.",
    alreadyRestoredText: "Service rétabli le",
    adminUnlockedToast: "Accès Administration déverrouillé !",
    filterSectorLabel: "Quartier",
    filterAllSectors: "Tous Quartiers",
    sectorLabel: "Secteur / Quartier :"
  },
  ar: {
    title: "الجم لايف",
    subtitle: "مركز المتابعة المباشرة",
    water: "ماء",
    elec: "كهرباء",
    net: "إنترنت",
    reportBtn: "إبلاغ",
    recentFeedBtn: "آخر 5 بلاغات",
    adminBtnLabel: "الإدارة",
    auditBtnLabel: "التدقيق البرمجي",
    stepLangTitle: "مرحباً بكم في منصة الجم",
    stepLangSub: "اختر لغة الواجهة للبدء:",
    stepLocTitle: "تحديد موقع الانقطاع",
    stepLocSub: "يرجى التثبت من موقع البلاغ بدقة.",
    locDetecting: "📍 جاري البحث عن موقعك الحقيقي...",
    locIPSuccess: "📍 تم تحديد موقع تقريبي عبر الشبكة.",
    locGPSSuccess: "📍 تم التقاط إحداثيات GPS بدقة فائقة !",
    locFailed: "⚠️ تعذر التحديد التلقائي. يرجى التحديد اليدوي.",
    locChosen: "📍 تم تثبيت موقع البلاغ بنجاح !",
    locManualBtn: "تحديد يدوي على الخريطة",
    stepTypeTitle: "نوع الانقطاع",
    stepTypeSub: "ما هي الخدمة المتأثرة ؟",
    ispLabel: "مزود خدمة الإنترنت (FAI):",
    stepDetailsTitle: "تفاصيل البلاغ",
    stepDetailsSub: "أضف أية ملاحظة نافعة (الشارع، الحي، المدة):",
    notePlaceholder: "مثال: انقطاع الماء بالحي الإداري منذ ساعتين...",
    backBtn: "رجوع",
    nextBtn: "متابعة",
    submitBtn: "إرسال البلاغ الآن",
    submitSending: "جاري الإرسال...",
    toastSuccess: "تم إرسال البلاغ ! وهو قيد المراجعة.",
    adminTitle: "لوحة تحكم المشرفين",
    adminPassPlaceholder: "كلمة المرور السرية",
    adminLoginBtn: "تسجيل الدخول",
    adminIncorrectPass: "كلمة المرور غير صحيحة",
    adminEmpty: "لا توجد بلاغات تطابق نتائج الفلترة",
    approveBtn: "نشر على الخريطة",
    rejectBtn: "رفض",
    deleteBtn: "حذف نهائي",
    deleteConfirm: "هل تريد حذف هذا البلاغ نهائياً من الخريطة والأرشيف ؟",
    toastDeleted: "تم حذف البلاغ",
    changeTypeLabel: "نوع الخدمة",
    toastTypeChanged: "تم تحديث نوع البلاغ",
    adminDateReset: "إعادة ضبط",
    messengerContactLabel: "تواصل معنا",
    adminPendingTitle: "بلاغات قيد المراجعة",
    adminPublishedTitle: "البلاغات المنشورة على الخريطة",
    adminRejectedTitle: "البلاغات المرفوضة",
    adminPublishedEmpty: "لا توجد بلاغات منشورة حالياً",
    toastPublished: "تمت الموفقة والنشر !",
    toastRejected: "تم رفض البلاغ",
    popupWater: "انقطاع المياه",
    popupElec: "انقطاع الكهرباء",
    popupNet: "انقطاع الإنترنت",
    popupPending: "⏳ قيد المراجعة",
    signalTime: "تم الإبلاغ {time}",
    confirmPickBtn: "تأكيد هذا الموقع",
    pickPromptText: "📍 حرك الخريطة لضبط المؤشر المركزي",
    pickWaitingText: "اسحب الخريطة لتحديد الشارع بدقة...",
    pickSearching: "جاري التعرف على العنوان...",
    bannerStatsLabel: "📊 البلاغات النشطة",
    visitorCountLabel: "متابع متصل الآن",
    recentTitle: "🚨 آخر 5 بلاغات مباشرة",
    recentSub: "متابعة فورية مع مؤشرات إضاءة ورموز وامضة",
    noRecent: "لا توجد بلاغات حديثة",
    clickToCenter: "انقر للتركيز على الموقع في الخريطة",
    adminSearchPlaceholder: "بحث حسب الشارع، الحي، الملاحظات...",
    allTypes: "جميع الأنواع",
    allISPs: "جميع المزودين",
    allStatuses: "جميع الحالات",
    tabDashboard: "لوحة الإحصائيات",
    tabPending: "قيد الانتظار",
    tabApproved: "المنشورة",
    tabRejected: "المرفوضة",
    markRestoredBtn: "✅ الإبلاغ عن عودة الخدمة",
    restoredBadge: "✅ عاد للعمل",
    restoredToast: "شكراً لك ! تم تسجيل عودة الخدمة بنجاح.",
    restoredDeniedToast: "⚠️ فقط صاحب البلاغ الأصلي (نفس الجهاز/الشبكة) يمكنه تأكيد عودة الخدمة.",
    alreadyRestoredText: "عادت الخدمة بتاريخ",
    adminUnlockedToast: "تم تفعيل الوصول لوحة الإدارة !",
    filterSectorLabel: "الحي",
    filterAllSectors: "جميع الأحياء",
    sectorLabel: "الحي / المنطقة :"
  }
};

export interface MapLandmark {
  id: string;
  nameFr: string;
  nameAr: string;
  lat: number;
  lng: number;
  icon: string;
  category: 'monument' | 'transit' | 'health' | 'civic' | 'culture';
}

export const EL_JEM_LANDMARKS: MapLandmark[] = [
  { id: 'colisee', nameFr: "Amphithéâtre / Colisée Romain", nameAr: "القصر الروماني بالجم", lat: 35.2965, lng: 10.7069, icon: "🏛️", category: "monument" },
  { id: 'musee', nameFr: "Musée Archéologique & Mosaïques", nameAr: "المتحف الأثري بالجم", lat: 35.2905, lng: 10.7058, icon: "🏛️", category: "monument" },
  { id: 'gare', nameFr: "Gare Ferroviaire SNCFT", nameAr: "محطة القطار بالجم", lat: 35.2982, lng: 10.7108, icon: "🚆", category: "transit" },
  { id: 'hopital', nameFr: "Hôpital Local d'El Jem", nameAr: "المستشفى المحلي بالجم", lat: 35.3015, lng: 10.7125, icon: "🏥", category: "health" },
  { id: 'municipalite', nameFr: "Hôtel de Ville (Municipalité)", nameAr: "بلدية الجم", lat: 35.2980, lng: 10.7078, icon: "🏛️", category: "civic" },
  { id: 'culture', nameFr: "Maison de la Culture", nameAr: "دار الثقافة حسن الزمرلي", lat: 35.2952, lng: 10.7112, icon: "🎭", category: "culture" }
];

export const INITIAL_SAMPLE_REPORTS: OutageReport[] = [
  {
    id: "sample_1",
    type: "eau",
    isp: null,
    note: "Coupure d'eau générale près du Colisée Romain d'El Jem.",
    lat: 35.2965,
    lng: 10.7068,
    createdAt: Date.now() - 1000 * 60 * 12,
    status: "approved",
    approvedAt: Date.now() - 1000 * 60 * 10
  },
  {
    id: "sample_2",
    type: "elec",
    isp: null,
    note: "Pannes répétées STEG avenue Habib Bourguiba.",
    lat: 35.2981,
    lng: 10.7092,
    createdAt: Date.now() - 1000 * 60 * 25,
    status: "approved",
    approvedAt: Date.now() - 1000 * 60 * 20
  },
  {
    id: "sample_3",
    type: "net",
    isp: "Tunisie Telecom",
    note: "Ligne Fixe / Fibre coupée quartier Nord.",
    lat: 35.2948,
    lng: 10.7042,
    createdAt: Date.now() - 1000 * 60 * 45,
    status: "approved",
    approvedAt: Date.now() - 1000 * 60 * 35
  },
  {
    id: "sample_4",
    type: "net",
    isp: "Orange Tunisie",
    note: "Perturbation du réseau mobile 4G.",
    lat: 35.2992,
    lng: 10.7115,
    createdAt: Date.now() - 1000 * 60 * 70,
    status: "approved",
    approvedAt: Date.now() - 1000 * 60 * 60
  },
  {
    id: "sample_5",
    type: "eau",
    isp: null,
    note: "Baisse de pression d'eau quartier la Gare.",
    lat: 35.2932,
    lng: 10.7021,
    createdAt: Date.now() - 1000 * 60 * 90,
    status: "approved",
    approvedAt: Date.now() - 1000 * 60 * 80
  },
  {
    id: "sample_6",
    type: "net",
    isp: "Ooredoo Tunisie",
    note: "Problème de connexion ADSL.",
    lat: 35.2952,
    lng: 10.7142,
    createdAt: Date.now() - 1000 * 60 * 120,
    status: "pending"
  }
];

// Determine which operator logo to show for a given report.
// Eau -> SONEDE (monopole national), Elec -> STEG (monopole national),
// Net -> selon l'ISP declare par le signalement.
export function getReportCompanyLogo(report: OutageReport): string {
  if (report.type === 'eau') return OPERATOR_LOGOS.sonede;
  if (report.type === 'elec') return OPERATOR_LOGOS.steg;
  switch (report.isp) {
    case 'Tunisie Telecom': return OPERATOR_LOGOS.tt;
    case 'Orange Tunisie': return OPERATOR_LOGOS.orange;
    case 'Ooredoo Tunisie': return OPERATOR_LOGOS.ooredoo;
    case 'Bee / Topnet / GNet': return OPERATOR_LOGOS.topnet;
    default: return OPERATOR_LOGOS.tt;
  }
}
