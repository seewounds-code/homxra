import React from "react";
import { createUseStyles } from "react-jss";
import ItemImage from "../../itemImage";
import TradeWindowStore from "../stores/tradeWindowStore";

const useStyles = createUseStyles({
  offerPanel: {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '6px',
    padding: '16px',
  },
  offerPanelHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    marginBottom: '14px',
  },
  panelTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#191919',
    margin: 0,
  },
  slotStack: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '8px',
    marginBottom: '12px',
  },
  slot: {
    aspectRatio: '1 / 1',
    border: '1px dashed #d0d0d0',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d0d0d0',
    fontSize: '22px',
    background: '#fcfcfc',
    position: 'relative',
    overflow: 'hidden',
  },
  slotFilled: {
    border: '1px solid #e5e5e5',
    background: '#fff',
    cursor: 'pointer',
    '&:hover': {
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    },
  },
  slotImageWrap: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '52px 1fr',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    padding: '4px',
    gap: '6px',
  },
  slotImage: {
    width: '52px',
    height: '52px',
    borderRadius: '3px',
    overflow: 'hidden',
    background: '#f6f6f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  slotImg: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
    paddingTop: '0',
    margin: '0 auto',
    display: 'block',
  },
  slotInfo: {
    minWidth: 0,
  },
  slotName: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#191919',
    margin: '0 0 2px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  slotValue: {
    fontSize: '12px',
    color: '#008000',
    fontWeight: 600,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  robuxIcon: {
    width: '12px',
    height: '12px',
    background: 'url(/img/img-robux.png) no-repeat center',
    backgroundSize: 'contain',
    display: 'inline-block',
  },
  robuxInputWrap: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid #d0d0d0',
    borderRadius: '3px',
    padding: '0 8px',
    background: '#fff',
  },
  robuxInputIcon: {
    width: '16px',
    height: '16px',
    background: 'url(/img/img-robux.png) no-repeat center',
    backgroundSize: 'contain',
  },
  robuxInput: {
    width: '100%',
    border: 'none',
    padding: '8px 0',
    fontSize: '14px',
    outline: 'none',
    color: '#191919',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '10px',
    borderTop: '1px solid #f0f0f0',
  },
  totalLabel: {
    fontSize: '14px',
    color: '#757575',
    margin: 0,
  },
  totalValue: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#008000',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  removingLink: {
    fontSize: '12px',
    color: '#e74c3c',
    cursor: 'pointer',
  },
});

const OfferPanel = (props) => {
  const { mode } = props;
  const store = TradeWindowStore.useContainer();
  const s = useStyles();

  const items = mode === 'Offer' ? store.offerItems : store.requestItems;
  const robux = mode === 'Offer' ? store.offerRobux : store.requestRobux;
  const feePct = 0.3;

  const itemTotal = items.reduce((a, b) => a + (b.recentAveragePrice || 0), 0);
  const robuxValue = robux || 0;
  const grandTotal = itemTotal + robuxValue;
  const fee = Math.round(robuxValue * feePct);

  const setRobux = (v) => {
    if (v < 0 || v > 100000000 || isNaN(v)) {
      if (mode === 'Offer') {
        store.setOfferRobux(0);
      } else {
        store.setRequestRobux(0);
      }
      return
    }
    if (mode === 'Offer') {
      store.setOfferRobux(v);
    } else {
      store.setRequestRobux(v);
    }
  };

  const removeItem = (userAssetId) => {
    if (mode === 'Offer') {
      store.setOfferItems(store.offerItems.filter(v => v.userAssetId !== userAssetId));
    } else {
      store.setRequestItems(store.requestItems.filter(v => v.userAssetId !== userAssetId));
    }
  };

  const slots = [...items];
  for (let i = items.length; i < 4; i++) {
    slots.push(null);
  }

  return <div className={s.offerPanel}>
    <div className={s.offerPanelHeader}>
      <h3 className={s.panelTitle}>Your {mode}</h3>
    </div>

    <div className={s.slotStack}>
      {slots.map((v, i) => v
        ? <div key={v.userAssetId} className={s.slot + ' ' + s.slotFilled} onClick={() => removeItem(v.userAssetId)}>
          <div className={s.slotImageWrap}>
            <div className={s.slotImage}>
              <ItemImage className={s.slotImg} id={v.assetId} name={v.name} />
            </div>
            <div className={s.slotInfo}>
              <p className={s.slotName}>{v.name}</p>
              <div className={s.slotValue}>
                <span className={s.robuxIcon}></span>
                {(v.recentAveragePrice || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        : <div key={'empty' + i} className={s.slot}>+</div>
      )}
    </div>

    <div className={s.robuxInputWrap}>
      <span className={s.robuxInputIcon}></span>
      <input
        className={s.robuxInput}
        value={(robux || '')}
        type='text'
        placeholder='Robux amount'
        onChange={(e) => {
          setRobux(parseInt(e.currentTarget.value, 10));
        }}
      />
    </div>

    <div className={s.totalRow}>
      <p className={s.totalLabel}>Total Value</p>
      <div className={s.totalValue}>
        <span className={s.robuxIcon}></span>
        {grandTotal.toLocaleString()}
      </div>
    </div>
  </div>;
}

export default OfferPanel;