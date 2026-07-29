import {
  Bike,
  CalendarDays,
  ChartNoAxesCombined,
  CircleUserRound,
  Dices,
  Flame,
  House,
  Images,
  LogOut,
  Medal,
  Scale,
  Trophy,
} from "lucide-react";

export const navigation = [
  {
    id: "home",
    label: "Accueil",
    icon: House,
  },
  {
    id: "events",
    label: "Événements",
    icon: CalendarDays,
  },
  {
    id: "tennis",
    label: "Tennis",
    icon: Trophy,
  },
  {
    id: "bike",
    label: "Cyclisme",
    icon: Bike,
  },
  {
    id: "ranking",
    label: "Classement",
    icon: Medal,
  },
  {
    id: "statistics",
    label: "Statistiques",
    icon: ChartNoAxesCombined,
  },
  {
    id: "gallery",
    label: "Galerie",
    icon: Images,
  },
  {
    id: "gages",
    label: "Gages",
    icon: Dices,
  },
  {
    id: "tribunal",
    label: "Tribunal",
    icon: Scale,
  },
  {
    id: "members",
    label: "Membres",
    icon: CircleUserRound,
  },
  {
    id: "challenges",
    label: "Défis",
    icon: Flame,
  },
  {
    id: "logout",
    label: "Déconnexion",
    icon: LogOut,
  },
];

export const implementedPages = new Set([
  "home",
  "events",
  "tennis",
  "bike",
  "ranking",
  "statistics",
  "gallery",
  "gages",
  "tribunal",
  "members",
  "challenges",
  "profile",
]);

export function getNavigationItem(pageId) {
  return (
    navigation.find(
      (item) => item.id === pageId,
    ) ?? null
  );
}

export function getPageTitle(pageId) {
  return (
    getNavigationItem(pageId)?.label ??
    "Accueil"
  );
}

export function isImplementedPage(pageId) {
  return implementedPages.has(pageId);
}