import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import getFlag from "../../../lib/getFlag";
import t from "../../../lib/t";
import { getCollectibleInventory } from "../../../services/inventory";
import AuthenticationStore from "../../../stores/authentication";
import ItemImage from "../../itemImage";
import Link from "../../link";
import TradeWindowStore from "../stores/tradeWindowStore";

const useStyles = createUseStyles({
  inventorySection: {
    minWidth: 0,
  },
  inventoryHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 280px',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '14px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#191919',
    margin: 0,
  },
  select: {
    width: '100%',
    padding: '6px 8px',
    fontSize: '14px',
    border: '1px solid #d0d0d0',
    borderRadius: '3px',
    background: '#fff',
    color: '#191919',
    cursor: 'pointer',
    outline: 'none',
  },
  itemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px',
  },
  itemButton: {
    border: 'none',
    background: 'none',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
    outline: 'none',
    borderRadius: '4px',
  },
  itemThumb: {
    position: 'relative',
    aspectRatio: '1 / 1',
    width: '100%',
    background: '#f6f6f6',
    borderRadius: '4px',
    overflow: 'hidden',
    border: '1px solid #e5e5e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
    paddingTop: '0',
    margin: '0 auto',
    display: 'block',
  },
  serialBadge: {
    position: 'absolute',
    bottom: '4px',
    left: '4px',
    background: 'rgba(32,32,32,0.82)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 500,
    padding: '2px 5px',
    borderRadius: '3px',
  },
  emptySlotOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed #d0d0d0',
    borderRadius: '4px',
    color: '#bbb',
    fontSize: '13px',
    pointerEvents: 'none',
  },
  selectedCheck: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#00a000',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
  },
  itemName: {
    margin: '6px 0 0',
    fontSize: '13px',
    color: '#191919',
    lineHeight: '1.3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    height: '34px',
    textAlign: 'center',
  },
  itemValue: {
    margin: '2px 0 0',
    fontSize: '12px',
    color: '#008000',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
  },
  robuxIcon: {
    width: '12px',
    height: '12px',
    background: 'url(/img/img-robux.png) no-repeat center',
    backgroundSize: 'contain',
    display: 'inline-block',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
    fontSize: '14px',
    color: '#191919',
    userSelect: 'none',
  },
  pageBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#0066cc',
    padding: '2px 4px',
    '&:disabled': {
      color: '#ccc',
      cursor: 'default',
    },
  },
  pageLabel: {
    fontSize: '14px',
    minWidth: '60px',
    textAlign: 'center',
  },
  feedbackText: {
    padding: '40px 0',
    textAlign: 'center',
    color: '#757575',
    fontSize: '14px',
    margin: 0,
  },
  emptyText: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: '#999',
    fontSize: '14px',
    padding: '24px 0',
    margin: 0,
  },
});

const assetTypeOptions = [
  { value: 'null', label: 'All Accessories' },
  { value: '8', label: 'Hats' },
  { value: '41', label: 'Hair' },
  { value: '42', label: 'Face' },
  { value: '43', label: 'Neck' },
  { value: '44', label: 'Shoulders' },
  { value: '45', label: 'Front' },
  { value: '46', label: 'Back' },
  { value: '47', label: 'Waist' },
  { value: '19', label: 'Gear' },
  { value: '18', label: 'Faces' },
];

const InventorySection = (props) => {
  const { mode } = props;
  const limit = getFlag('tradeWindowInventoryCollectibleLimit', 25);

  const auth = AuthenticationStore.useContainer();
  const store = TradeWindowStore.useContainer();

  const [response, setResponse] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [page, setPage] = useState(1);
  const [assetType, setAssetType] = useState('null');
  const [feedback, setFeedback] = useState(null);

  const s = useStyles();

  useEffect(() => {
    const userId = mode === 'Offer' ? auth.userId : store.partnerUserId;

    if (!userId) {
      setFeedback('Loading inventory...');
      return;
    }

    setFeedback(null);
    getCollectibleInventory({
      userId,
      limit,
      assetTypeId: assetType,
      cursor,
    }).then(data => {
      setResponse(data);
      if (data.data && data.data.length === 0) {
        setFeedback('No items in this category.');
      }
    }).catch(e => {
      setResponse(null);
      if (e.response?.status === 403) {
        setFeedback('This player has a private inventory.');
      } else if (e.response?.status === 400) {
        setFeedback('This player is not available.');
      } else {
        setFeedback(e.message);
      }
    })
  }, [cursor, assetType, mode, auth.userId, store.partnerUserId]);

  const items = response && t.array(response.data);
  const isInList = (userAssetId) => mode === 'Offer'
    ? store.offerItems.some(v => v.userAssetId === userAssetId)
    : store.requestItems.some(v => v.userAssetId === userAssetId);

  const toggleItem = (item) => {
    const list = mode === 'Offer' ? store.offerItems : store.requestItems;
    const setList = mode === 'Offer' ? store.setOfferItems : store.setRequestItems;
    if (isInList(item.userAssetId)) {
      setList(list.filter(v => v.userAssetId !== item.userAssetId));
    } else {
      if (list.length >= 4) return;
      setList([...list, item]);
    }
  };

  return <div className={s.inventorySection}>
    <div className={s.inventoryHeader}>
      <h2 className={s.sectionTitle}>{mode === 'Offer' ? 'Your Inventory' : 'User\'s Inventory'}</h2>
      <select className={s.select} value={assetType} onChange={(e) => {
        setCursor(null);
        setPage(1);
        setAssetType(e.currentTarget.value);
      }}>
        {assetTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>

    {items && items.length > 0 && <div className={s.itemGrid}>
      {items.map(v => {
        const selected = isInList(v.userAssetId);
        return <button
          key={v.userAssetId}
          className={s.itemButton}
          onClick={() => toggleItem(v)}
        >
          <div className={s.itemThumb}>
            <ItemImage className={s.itemImage} id={v.assetId} name={v.name} />
            {v.serialNumber && <span className={s.serialBadge}>#{v.serialNumber}</span>}
            {selected && <span className={s.selectedCheck}>✓</span>}
          </div>
          <p className={s.itemName}>{v.name}</p>
          <div className={s.itemValue}>
            <span className={s.robuxIcon}></span>
            {(v.recentAveragePrice || 0).toLocaleString()}
          </div>
        </button>;
      })}
    </div>}

    {items && items.length === 0 && <p className={s.emptyText}>User does not have any items in this category.</p>}
    {feedback && <p className={s.feedbackText}>{feedback}</p>}

    {response && items && items.length > 0 && <div className={s.pagination}>
      <button
        className={s.pageBtn}
        disabled={!response.previousPageCursor}
        onClick={() => {
          setCursor(response.previousPageCursor);
          setPage(page - 1);
        }}
      >‹</button>
      <span className={s.pageLabel}>Page {page}</span>
      <button
        className={s.pageBtn}
        disabled={!response.nextPageCursor}
        onClick={() => {
          setCursor(response.nextPageCursor);
          setPage(page + 1);
        }}
      >›</button>
    </div>}
  </div>
}

export default InventorySection;