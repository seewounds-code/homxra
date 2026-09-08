import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import { acceptTrade, declineTrade } from "../../../services/trades";
import AuthenticationStore from "../../../stores/authentication";
import ItemImage from "../../itemImage";

dayjs.extend(relativeTime);

const useDetailsStyles = createUseStyles({
  detailTitle: {
    margin: '0 0 4px',
    fontSize: '22px',
    fontWeight: 600,
    color: '#191919',
  },
  expires: {
    margin: '0 0 20px',
    fontSize: '13px',
    color: '#757575',
  },
  section: {
    marginBottom: '16px',
  },
  sectionTitle: {
    margin: '0 0 10px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#191919',
  },
  itemGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    minHeight: '186px',
  },
  itemCard: {
    width: '126px',
    textAlign: 'center',
  },
  thumbWrap: {
    position: 'relative',
    width: '126px',
    height: '126px',
    background: '#f6f6f6',
    borderRadius: '4px',
    overflow: 'hidden',
    border: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
    paddingTop: '0',
    margin: '0 auto',
    display: 'block',
  },
  limitedBadge: {
    position: 'absolute',
    bottom: '4px',
    left: '4px',
    background: 'rgba(100,100,100,0.85)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: '3px',
    letterSpacing: '0.3px',
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
    width: '13px',
    height: '13px',
    background: 'url(/img/img-robux.png) no-repeat center',
    backgroundSize: 'contain',
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  sectionDivider: {
    height: '1px',
    background: '#e5e5e5',
    margin: '16px 0',
  },
  totalRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    padding: '12px 0',
    borderTop: '1px solid #e5e5e5',
  },
  totalLabel: {
    fontSize: '15px',
    color: '#191919',
    fontWeight: 500,
    margin: 0,
  },
  totalValue: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#008000',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e5e5',
  },
  actionBtn: {
    flex: 1,
    padding: '10px 16px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'background 0.15s',
  },
  acceptBtn: {
    background: '#00a000',
    color: '#fff',
    '&:hover': {
      background: '#008a00',
    },
  },
  declineBtn: {
    background: '#e74c3c',
    color: '#fff',
    '&:hover': {
      background: '#c0392b',
    },
  },
  counterBtn: {
    background: '#fff',
    color: '#191919',
    border: '1px solid #d0d0d0',
    '&:hover': {
      background: '#f5f5f5',
    },
  },
  statusPill: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: 500,
    marginTop: '12px',
  },
  pillOpen: {
    background: '#e6f4ea',
    color: '#1e7e34',
  },
  pillPending: {
    background: '#e8f0fe',
    color: '#1a73e8',
  },
  pillExpired: {
    background: '#f0f0f0',
    color: '#757575',
  },
  pillFinished: {
    background: '#e8f0fe',
    color: '#1a73e8',
  },
  pillDeclined: {
    background: '#fde8e8',
    color: '#c0392b',
  },
  pillInactive: {
    background: '#f0f0f0',
    color: '#757575',
  },
  pillCountered: {
    background: '#f3e8fd',
    color: '#7b1fa2',
  },
  feedback: {
    marginTop: '12px',
    padding: '8px 12px',
    borderRadius: '3px',
    fontSize: '14px',
  },
  feedbackSuccess: {
    background: '#e6f4ea',
    color: '#1e7e34',
    border: '1px solid #a3d9b1',
  },
  feedbackError: {
    background: '#fde8e8',
    color: '#c0392b',
    border: '1px solid #f1a9a0',
  },
  creatorLink: {
    color: '#0066cc',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  emptyItems: {
    color: '#999',
    fontSize: '13px',
    fontStyle: 'italic',
    padding: '12px 0',
    margin: 0,
  },
});

const getPillClass = (status, s) => {
  const map = {
    'Open': s.pillOpen,
    'Pending': s.pillPending,
    'Expired': s.pillExpired,
    'Finished': s.pillFinished,
    'Declined': s.pillDeclined,
    'Inactive': s.pillInactive,
    'Countered': s.pillCountered,
  };
  return map[status] || s.pillExpired;
};

const TradeDetails = (props) => {
  const s = useDetailsStyles();
  const auth = AuthenticationStore.useContainer();
  const { tradeDetails, onAction } = props;

  const [locked, setLocked] = useState(false);
  const [localFeedback, setLocalFeedback] = useState(null);

  if (!tradeDetails) return null;

  const authOffer = tradeDetails.offers.find(v => v.user.id === auth.userId);
  const otherOffer = tradeDetails.offers.find(v => v.user.id !== auth.userId);
  const canAccept = tradeDetails.status === 'Open' && tradeDetails.user.id !== auth.userId;
  const canDecline = canAccept || tradeDetails.user.id === auth.userId;

  const giveItems = authOffer ? authOffer.userAssets : [];
  const receiveItems = otherOffer ? otherOffer.userAssets : [];
  const giveRobux = authOffer ? (authOffer.robux || 0) : 0;
  const receiveRobux = otherOffer ? (otherOffer.robux || 0) : 0;
  const giveValue = giveItems.reduce((a, b) => a + (b.recentAveragePrice || 0), 0) + giveRobux;
  const receiveValue = receiveItems.reduce((a, b) => a + (b.recentAveragePrice || 0), 0) + receiveRobux;

  const handleAccept = () => {
    if (locked) return;
    setLocked(true);
    setLocalFeedback(null);
    acceptTrade({ tradeId: tradeDetails.id }).then(() => {
      onAction();
    }).catch(e => {
      setLocalFeedback({ type: 'error', text: 'Could not accept trade. Please try again.' });
    }).finally(() => {
      setLocked(false);
    });
  };

  const handleDecline = () => {
    if (locked) return;
    setLocked(true);
    setLocalFeedback(null);
    declineTrade({ tradeId: tradeDetails.id }).then(() => {
      onAction();
    }).catch(e => {
      setLocalFeedback({ type: 'error', text: 'Could not decline trade. Please try again.' });
    }).finally(() => {
      setLocked(false);
    });
  };

  const handleCounter = () => {
    window.open("/Trade/TradeWindow.aspx?TradeSessionId=" + tradeDetails.id + "&TradePartnerID=" + tradeDetails.user.id, "_blank", "scrollbars=0, height=608, width=914");
  };

  const expiresText = tradeDetails.expiration
    ? 'Expires ' + dayjs(tradeDetails.expiration).fromNow()
    : '';

  return <div>
    <h1 className={s.detailTitle}>Trade Details</h1>
    {expiresText && <p className={s.expires}>{expiresText}</p>}

    <div className={s.section}>
      <h2 className={s.sectionTitle}>Offered Items</h2>
      <div className={s.itemGrid}>
        {giveItems.map(item => <div key={item.id} className={s.itemCard}>
          <div className={s.thumbWrap}>
            <ItemImage id={item.assetId} name={item.name} className={s.thumbImg} />
            {tradeDetails.status === 'Countered' && <span className={s.limitedBadge}>Limited</span>}
          </div>
          <p className={s.itemName}>{item.name}</p>
          <div className={s.itemValue}>
            <span className={s.robuxIcon}></span>
            {(item.recentAveragePrice || 0).toLocaleString()}
          </div>
        </div>)}
        {giveRobux > 0 && <div className={s.itemCard}>
          <div className={s.thumbWrap}>
            <span style={{ fontSize: '32px' }}>R$</span>
          </div>
          <p className={s.itemName}>Robux</p>
          <div className={s.itemValue}>
            <span className={s.robuxIcon}></span>
            {giveRobux.toLocaleString()}
          </div>
        </div>}
        {giveItems.length === 0 && giveRobux === 0 && <p className={s.emptyItems}>No items offered</p>}
      </div>
    </div>

    <div className={s.sectionDivider}></div>

    <div className={s.section}>
      <h2 className={s.sectionTitle}>Requested Items</h2>
      <div className={s.itemGrid}>
        {receiveItems.map(item => <div key={item.id} className={s.itemCard}>
          <div className={s.thumbWrap}>
            <ItemImage id={item.assetId} name={item.name} className={s.thumbImg} />
            {tradeDetails.status === 'Countered' && <span className={s.limitedBadge}>Limited</span>}
          </div>
          <p className={s.itemName}>{item.name}</p>
          <div className={s.itemValue}>
            <span className={s.robuxIcon}></span>
            {(item.recentAveragePrice || 0).toLocaleString()}
          </div>
        </div>)}
        {receiveRobux > 0 && <div className={s.itemCard}>
          <div className={s.thumbWrap}>
            <span style={{ fontSize: '32px' }}>R$</span>
          </div>
          <p className={s.itemName}>Robux</p>
          <div className={s.itemValue}>
            <span className={s.robuxIcon}></span>
            {receiveRobux.toLocaleString()}
          </div>
        </div>}
        {receiveItems.length === 0 && receiveRobux === 0 && <p className={s.emptyItems}>No items requested</p>}
      </div>
    </div>

    <div className={s.totalRow}>
      <p className={s.totalLabel}>Total Value</p>
      <div className={s.totalValue}>
        <span className={s.robuxIcon}></span>
        {(giveValue + receiveValue).toLocaleString()}
      </div>
    </div>

    {canAccept && <div className={s.actions}>
      <button
        className={s.actionBtn + ' ' + s.acceptBtn}
        disabled={locked}
        onClick={handleAccept}
      >Accept</button>
      <button
        className={s.actionBtn + ' ' + s.declineBtn}
        disabled={locked}
        onClick={handleDecline}
      >Decline</button>
      <button
        className={s.actionBtn + ' ' + s.counterBtn}
        onClick={handleCounter}
      >Counter</button>
    </div>}

    {!canAccept && canDecline && tradeDetails.user.id === auth.userId && <div className={s.actions}>
      <button
        className={s.actionBtn + ' ' + s.declineBtn}
        disabled={locked}
        onClick={handleDecline}
      >Cancel Trade</button>
    </div>}

    {tradeDetails.status !== 'Open' && <div>
      <span className={s.statusPill + ' ' + getPillClass(tradeDetails.status, s)}>
        {tradeDetails.status}
      </span>
    </div>}

    {localFeedback && <div className={s.feedback + ' ' + (localFeedback.type === 'error' ? s.feedbackError : s.feedbackSuccess)}>
      {localFeedback.text}
    </div>}
  </div>;
};

export default TradeDetails;
