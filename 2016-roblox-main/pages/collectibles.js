import { useRouter } from "next/router";
import CollectiblesPageStore from "../components/collectiblesPage/stores/collectiblesPageStore";
import CollectiblesPage from "../components/collectiblesPage";
import Theme2016 from "../components/theme2016";

const Collectibles = props => {
  const router = useRouter();
  const userId = router.query['userId'];
  return <CollectiblesPageStore.Provider>
    <Theme2016>
      <CollectiblesPage userId={userId}/>
    </Theme2016>
  </CollectiblesPageStore.Provider>
}

export default Collectibles;