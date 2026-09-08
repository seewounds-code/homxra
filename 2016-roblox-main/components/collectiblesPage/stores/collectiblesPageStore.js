import { createContainer } from "unstated-next";
import { useEffect, useState } from "react";
import { getCollectibleInventory } from "../../../services/inventory";
import { getUserInfo } from "../../../services/users";

const limit = 50;

const CollectiblesPageStore = createContainer(() => {
  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [items, setItems] = useState(null);
  const [totalRap, setTotalRap] = useState(0);
  const [error, setError] = useState(null);
  const [nextPageCursor, setNextPageCursor] = useState(null);
  const [previousPageCursor, setPreviousPageCursor] = useState(null);
  const [loading, setLoading] = useState(false);

  const setPage = (before, after) => {
    if (loading) return;
    if (before && !previousPageCursor) return;
    if (after && !nextPageCursor) return;

    let cursor = '';
    if (before) cursor = previousPageCursor;
    if (after) cursor = nextPageCursor;

    setLoading(true);
    getCollectibleInventory({
      userId,
      cursor: cursor,
      limit: limit,
    }).then(d => {
      setItems(d.data);
      setTotalRap(d.totalRap || 0);
      setNextPageCursor(d.nextPageCursor);
      setPreviousPageCursor(d.previousPageCursor);
      setError(null);
    }).catch(e => {
      setError(e);
    }).finally(() => {
      setLoading(false);
    });
  }

  useEffect(() => {
    if (!userId) return;
    setUserInfo(null);
    setItems(null);
    setTotalRap(0);
    setError(null);
    setNextPageCursor(null);
    setPreviousPageCursor(null);
    getUserInfo({ userId }).then(info => {
      setUserInfo(info);
    }).catch(e => {
      setError(e);
    });
    setPage(false, false);
  }, [userId]);

  return {
    userId,
    setUserId,

    userInfo,
    items,
    totalRap,
    error,
    loading,

    nextPageCursor,
    previousPageCursor,
    setPage,
  }
});

export default CollectiblesPageStore;