import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";
import { createUseStyles } from "react-jss";
import AuthenticationStore from "../../../stores/authentication";
import ThumbnailStore from "../../../stores/thumbnailStore";
import TradeStore from "../../myMoney/stores/tradeStore";

dayjs.extend(relativeTime);

const usePageStyles = createUseStyles({
  aside: {
    position: 'sticky',
    top: '24px',
    border: '1px solid #e5e5e5',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  listHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 198px',
    alignItems: 'center',
    gap: '20px',
    padding: '16px 16px 12px',
    borderBottom: '1px solid #e5e5e5',
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 600,
    color: '#191919',
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
  helpLink: {
    display: 'block',
    padding: '10px 16px',
    fontSize: '13px',
    color: '#0066cc',
    textDecoration: 'none',
    borderBottom: '1px solid #e5e5e5',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  tradeList: {
    border: '1px solid #e5e5e5',
    height: 'min(774px, calc(100vh - 220px))',
    overflowY: 'auto',
    minHeight: '420px',
  },
  tradeRow: {
    display: 'grid',
    gridTemplateColumns: '58px 1fr 66px',
    minHeight: '83px',
    borderBottom: '1px solid #e5e5e5',
    padding: '10px 10px 9px 14px',
    cursor: 'pointer',
    alignItems: 'center',
    background: '#fff',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    '&:hover': {
      background: '#f5f5f5',
    },
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  tradeRowSelected: {
    background: '#f0f0f0',
    '&:hover': {
      background: '#e8e8e8',
    },
  },
  avatarFrame: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    background: '#eee',
    border: '1px solid #ddd',
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  rowInfo: {
    minWidth: 0,
    paddingLeft: '10px',
  },
  rowName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#191919',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rowStatus: {
    fontSize: '13px',
    margin: 0,
    marginTop: '2px',
  },
  statusOpen: {
    color: '#2e8b57',
  },
  statusPending: {
    color: '#1a73e8',
  },
  statusDefault: {
    color: '#757575',
  },
  rowDateWrap: {
    textAlign: 'right',
    minWidth: 0,
  },
  rowDate: {
    fontSize: '11px',
    color: '#999',
    margin: 0,
  },
  emptyList: {
    padding: '40px 16px',
    textAlign: 'center',
    color: '#757575',
    fontSize: '14px',
  },
});

const getStatusColor = (status) => {
  if (status === 'Open') return 'statusOpen';
  if (status === 'Pending') return 'statusPending';
  return 'statusDefault';
};

const getStatusText = (tradeData, tradeType, authenticatedUserId) => {
  switch (tradeData.status) {
    case 'Open':
      if (tradeData.user.id === authenticatedUserId || tradeType === 'outbound' || tradeType === 'sent') {
        return 'Pending approval';
      }
      return 'Pending approval from you';
    default:
      return tradeData.status;
  }
};

const TradeRow = (props) => {
  const s = usePageStyles();
  const auth = AuthenticationStore.useContainer();
  const thumbs = ThumbnailStore.useContainer();
  const { trade, isSelected, onSelect } = props;

  const avatarUrl = thumbs.getUserHeadshot(trade.user.id) || '/img/placeholder.png';
  const statusText = getStatusText(trade, TradeStore.useContainer().tradeType, auth.userId);
  const statusClass = getStatusColor(trade.status);
  const dateStr = trade.created ? dayjs(trade.created).format('MM/DD/YY') : '';

  return <button
    className={s.tradeRow + (isSelected ? ' ' + s.tradeRowSelected : '')}
    onClick={() => onSelect(trade.id)}
  >
    <div className={s.avatarFrame}>
      <img className={s.avatar} src={avatarUrl} alt={trade.user.name}
        onError={e => { e.target.src = '/img/placeholder.png' }} />
    </div>
    <div className={s.rowInfo}>
      <p className={s.rowName}>{trade.user.name}</p>
      <p className={s.rowStatus + ' ' + s[statusClass]}>{statusText}</p>
    </div>
    <div className={s.rowDateWrap}>
      <p className={s.rowDate}>{dateStr}</p>
    </div>
  </button>;
};

const TradeList = (props) => {
  const s = usePageStyles();
  const trades = TradeStore.useContainer();
  const auth = AuthenticationStore.useContainer();

  return <div className={s.aside}>
    <div className={s.listHeader}>
      <h1 className={s.title}>Trades</h1>
      <select
        className={s.select}
        value={trades.tradeType}
        onChange={(e) => {
          trades.setTradeType(e.currentTarget.value);
          props.onSelectTrade(null);
        }}
      >
        <option value='inbound'>Inbound {auth.notificationCount && auth.notificationCount.trades ? '(' + auth.notificationCount.trades + ')' : ''}</option>
        <option value='outbound'>Outbound</option>
        <option value='completed'>Completed</option>
        <option value='inactive'>Inactive</option>
      </select>
    </div>
    <a className={s.helpLink} href='/help/trades' target='_blank' rel='noopener noreferrer'>
      How do I trade?
    </a>
    <div className={s.tradeList}>
      {trades.trades && trades.trades.data && trades.trades.data.length > 0
        ? trades.trades.data.map(v => {
          return <TradeRow
            key={v.id}
            trade={v}
            isSelected={props.selectedTradeId === v.id}
            onSelect={props.onSelectTrade}
          />;
        })
        : <div className={s.emptyList}>
          No trades available
        </div>
      }
    </div>
  </div>;
};

export default TradeList;
