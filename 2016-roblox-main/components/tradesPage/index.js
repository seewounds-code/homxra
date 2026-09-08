import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { getTradeDetails } from "../../services/trades";
import AuthenticationStore from "../../stores/authentication";
import TradeStore from "../myMoney/stores/tradeStore";
import TradeList from "./components/tradeList";
import TradeDetails from "./components/tradeDetails";

const usePageStyles = createUseStyles({
  page: {
    padding: '22px 24px 64px',
    maxWidth: '1188px',
    margin: '0 auto',
  },
  shell: {
    display: 'grid',
    gridTemplateColumns: '396px minmax(0, 1fr)',
    gap: '48px',
    alignItems: 'start',
  },
  emptyDetails: {
    padding: '40px 0',
    textAlign: 'center',
    color: '#757575',
    fontSize: '15px',
  },
});

const TradesPage = props => {
  const s = usePageStyles();
  const trades = TradeStore.useContainer();
  const auth = AuthenticationStore.useContainer();
  const [selectedTradeId, setSelectedTradeId] = useState(null);
  const [tradeDetails, setTradeDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setTradeDetails(null);
    setSelectedTradeId(null);
  }, [trades.tradeType]);

  useEffect(() => {
    if (!selectedTradeId) {
      setTradeDetails(null);
      return;
    }
    setDetailsLoading(true);
    getTradeDetails({ tradeId: selectedTradeId }).then(data => {
      setTradeDetails(data);
    }).catch(e => {
      setTradeDetails(null);
      setFeedback('Failed to load trade details.');
    }).finally(() => {
      setDetailsLoading(false);
    });
  }, [selectedTradeId]);

  const handleSelectTrade = (tradeId) => {
    setSelectedTradeId(tradeId);
    setFeedback(null);
  };

  return <div className={s.page}>
    <div className={s.shell}>
      <TradeList
        onSelectTrade={handleSelectTrade}
        selectedTradeId={selectedTradeId}
      />
      <div>
        {trades.feedback && <div style={{
          border: '1px solid #839ec3',
          background: '#e6eefa',
          padding: '8px 12px',
          marginBottom: '12px',
          borderRadius: '3px',
        }}>
          <p style={{ margin: 0 }}>{trades.feedback}</p>
        </div>}
        {feedback && <div style={{
          border: '1px solid #e74c3c',
          background: '#fde8e8',
          padding: '8px 12px',
          marginBottom: '12px',
          borderRadius: '3px',
        }}>
          <p style={{ margin: 0, color: '#c0392b' }}>{feedback}</p>
        </div>}
        {detailsLoading && <div style={{ padding: '40px 0', textAlign: 'center', color: '#757575' }}>
          Loading trade details...
        </div>}
        {!detailsLoading && selectedTradeId && tradeDetails && <TradeDetails
          tradeDetails={tradeDetails}
          onAction={() => {
            trades.refershTrades();
            setSelectedTradeId(null);
            setTradeDetails(null);
          }}
        />}
        {!detailsLoading && !selectedTradeId && <div className={s.emptyDetails}>
          Select a trade to view details.
        </div>}
      </div>
    </div>
  </div>
}

export default TradesPage;
