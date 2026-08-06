import {
  Bike,
  CalendarDays,
  ChartNoAxesCombined,
  CircleUserRound,
  Dices,
  Dumbbell,
  Flame,
  House,
  Images,
  LogOut,
  Medal,
  MessageCircle,
  Footprints,
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
    id: "workout",
    label: "Musculation",
    icon: Dumbbell,
  },
  {
    id: "walking",
    label: "Marche",
    icon: Footprints,
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
    id: "chat",
    label: "Chat",
    icon: MessageCircle,
  },
  {
    id: "logout",
    label: "Déconnexion",
    icon: LogOut,
  },
];

export function getNavigationItem(
  pageId,
) {
  return (
    navigation.find(
      (item) =>
        item.id === pageId,
    ) ?? navigation[0]
  );
}