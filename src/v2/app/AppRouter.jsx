import {
  useNavigation,
} from "../context/NavigationContext";

function AppRouter({
  pages = {},
  fallback = null,
}) {
  const {
    activePage,
  } = useNavigation();

  const PageComponent =
    pages[activePage];

  if (!PageComponent) {
    return fallback;
  }

  return <PageComponent />;
}

export default AppRouter;